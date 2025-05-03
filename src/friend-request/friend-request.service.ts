import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, isObjectIdOrHexString, Model, Types } from 'mongoose';
import {
  FriendRequest,
  StatusFriendRequest,
} from 'src/schemas/friend-request-schema';
import { IFriendRequestServices } from './types';
import { IUser } from 'src/schemas/user.schema';
import { IUserService } from 'src/user/types';
import { SERVICES, validateMongoId } from 'src/utils';
import { FriendShip } from 'src/schemas/friendship-schema';
import { IFriendShipServices } from 'src/friend-ship/types';

@Injectable()
export class FriendRequestService implements IFriendRequestServices {
  constructor(
    @InjectModel(FriendRequest.name)
    private readonly friendRequestModel: Model<FriendRequest>,

    @Inject(SERVICES.USERS) private readonly userService: IUserService,

    @Inject(SERVICES.FRIEND_SHIP_SERVICE)
    private readonly friendShipServices: IFriendShipServices,
  ) {}

  async findRequestFriend(
    query: FilterQuery<FriendShip>,
  ): Promise<FriendRequest> {
    return this.friendRequestModel.findOne(query);
  }

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
        $or: [
          {
            sender: user._id,
          },
          {
            receiver: user._id,
          },
        ],
        status: status ?? StatusFriendRequest.PENDING,
      })
      .populate('sender receiver')
      .lean();

    return fr;
  }

  async acceptRequestFriend(
    user: IUser,
    requestFriendId: string,
  ): Promise<any> {
    const validateId = validateMongoId(requestFriendId);

    if (!validateId) return;

    const friendRequest = await this.friendRequestModel.findByIdAndUpdate(
      requestFriendId,
      {
        status: StatusFriendRequest.ACCEPTED,
        acceptedAt: Date.now().toString(),
      },
    );

    if (!friendRequest)
      throw new HttpException(
        'Friend Request Not Existed',
        HttpStatus.FORBIDDEN,
      );

    const friend = await this.friendShipServices.createFriendShip({
      userId: user._id,
      friendRequest,
    });

    return friend;
  }
}
