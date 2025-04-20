import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isObjectIdOrHexString, Model, Types } from 'mongoose';
import {
  FriendRequest,
  StatusFriendRequest,
} from 'src/schemas/friend-request-schema';
import { IFriendRequestServices } from './types';
import { IUser } from 'src/schemas/user.schema';
import { IUserService } from 'src/user/types';
import { SERVICES } from 'src/utils';

@Injectable()
export class FriendRequestService implements IFriendRequestServices {
  constructor(
    @InjectModel(FriendRequest.name)
    private readonly friendRequestModel: Model<FriendRequest>,

    @Inject(SERVICES.USERS) private readonly userService: IUserService,
  ) {}

  async createRequestFriend(
    user: IUser,
    _receiverId: string,
  ): Promise<FriendRequest> {
    if (!isObjectIdOrHexString(_receiverId)) {
      throw new HttpException('Invalid receiverId', HttpStatus.BAD_REQUEST);
    }

    const userId = new Types.ObjectId(user._id);

    const receiverId = new Types.ObjectId(_receiverId);

    if (userId.toString() === receiverId.toString()) {
      throw new HttpException('Can not request Friend', HttpStatus.BAD_REQUEST);
    }

    const receiver = await this.userService.findUser({ _id: _receiverId });

    if (!receiver)
      throw new HttpException('Receiver Not found', HttpStatus.NOT_FOUND);

    const existed = await this.friendRequestModel.findOne({
      $or: [
        {
          sender: userId,
          receiver: receiverId,
        },
        {
          sender: receiverId,
          receiver: userId,
        },
      ],
      status: StatusFriendRequest.PENDING,
    });

    if (existed)
      throw new HttpException('Friend Request existed', HttpStatus.CONFLICT);

    const createUser = new this.friendRequestModel({
      sender: userId,
      receiver: receiverId,
      status: StatusFriendRequest.PENDING,
    });

    return createUser.save();
  }

  async getRequestFriend(
    user: IUser,
    status: StatusFriendRequest,
  ): Promise<FriendRequest[]> {
    const fr = await this.friendRequestModel
      .find({
        sender: user._id,
        status: status ?? StatusFriendRequest.PENDING,
      })
      .populate('receiver')
      .lean();

    return fr;
  }
}
