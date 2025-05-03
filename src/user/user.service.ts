import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { FriendRequest } from 'src/schemas/friend-request-schema';
import { User } from 'src/schemas/user.schema';
import { IUserService, UserWithFriendStatus } from './types';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(FriendRequest.name)
    private readonly friendRequestModel: Model<FriendRequest>,
  ) {}

  async findUser(query: FilterQuery<User>, pickPass = false) {
    const user = await this.userModel.findOne(query);

    if (!user) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);

    if (pickPass) {
      return user;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...responseUser } = user._doc;
    return responseUser as User;
  }

  async searchUsersByEmail(email: string, limit: number): Promise<User[]> {
    return this.userModel
      .find({
        email: {
          $regex: email,
          $options: 'i',
        },
      })
      .limit(limit)
      .select('-password -__v')
      .exec();
  }

  async searchUsersWithFriendStatus(
    userId: string,
    email: string,
    limit: number,
  ): Promise<UserWithFriendStatus[]> {
    const currentUserId = new Types.ObjectId(userId);

    const usersWithStatus = await this.userModel
      .aggregate<UserWithFriendStatus>([
        // 1) Filter users by email regex và loại trừ current user
        {
          $match: {
            //_id: { $ne: objectId }:
            // $ne nghĩa là "not equal" (không bằng).
            // Đảm bảo người dùng hiện tại (currentUserId) không xuất hiện trong kết quả.
            _id: { $ne: currentUserId },

            // email: { $regex: email, $options: 'i' }:
            // $regex cho phép tìm kiếm linh hoạt dựa trên biểu thức chính quy.
            // $options: 'i' làm cho tìm kiếm không phân biệt chữ hoa/thường.
            // Ví dụ: Nếu email = "test", nó khớp với "test@example.com", "TEST@domain.com", "user@test.com", v.v.
            email: {
              $regex: email,
              $options: 'i',
            },
          },
        },

        // 2) Giới hạn số bản ghi
        { $limit: limit },

        // 3) Lookup sang collection friendRequests để tìm tất cả requests liên quan
        // Mục đích: Kết nối với collection friendRequests để tìm các yêu
        // cầu kết bạn giữa người dùng hiện tại (currentUserId) và người dùng trong kết quả (otherId).
        {
          $lookup: {
            // from: Tên của collection friendRequests.
            from: this.friendRequestModel.collection.name,

            // let: { otherId: '$_id' }: Tạo biến otherId từ trường _id
            // của mỗi người dùng trong collection users.
            let: { otherId: '$_id' },

            pipeline: [
              {
                $match: {
                  $expr: {
                    $or: [
                      // sender là currentUser và receiver là user
                      {
                        $and: [
                          { $eq: ['$sender', currentUserId] },
                          { $eq: ['$receiver', '$$otherId'] },
                        ],
                      },

                      // receiver là currentUser và sender là user
                      {
                        $and: [
                          { $eq: ['$receiver', currentUserId] },
                          { $eq: ['$sender', '$$otherId'] },
                        ],
                      },
                    ],
                  },
                },
              },
              { $limit: 1 },
            ],
            as: 'friendRequest',
          },
        },

        // 4) Chuyển mảng friendRequest thành object (nếu có)

        {
          $unwind: {
            // Chỉ định trường mảng cần xử lý, ở đây là friendRequest.
            path: '$friendRequest',
            // Thông thường, $unwind sẽ bỏ qua các document nếu mảng rỗng ([]) hoặc không tồn tại. Tuy nhiên,
            //  với tùy chọn này, nó sẽ giữ lại document
            // và gán giá trị null cho friendRequest trong những trường hợp đó.
            preserveNullAndEmptyArrays: true,
          },
        },

        // 5) Build lại cấu trúc output: user + friendStatus (nếu có)
        {
          $project: {
            user: {
              _id: '$_id',
              name: '$name',
              email: '$email',
              fullName: '$fullName',
            },
            friendStatus: {
              $cond: {
                if: { $gt: ['$friendRequest', null] },
                then: {
                  status: '$friendRequest.status',
                  requestId: { $toString: '$friendRequest._id' },
                  isSender: { $eq: ['$friendRequest.sender', currentUserId] },
                },
                else: '$$REMOVE',
              },
            },
          },
        },
      ])
      .exec();

    return usersWithStatus;
  }
}
