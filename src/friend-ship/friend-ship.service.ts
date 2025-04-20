import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FriendShip } from 'src/schemas/friendship-schema';
import { IFriendShipServices, IPramsCreateFriendShip } from './types';

@Injectable()
export class FriendShipService implements IFriendShipServices {
  constructor(
    @InjectModel(FriendShip.name)
    private readonly friendShipModel: Model<FriendShip>,
  ) {}

  async createFriendShip(params: IPramsCreateFriendShip): Promise<FriendShip> {
    const { friendRequest, userId } = params;

    if (friendRequest.sender._id.toString() === userId.toString()) {
      throw new HttpException(
        "Can't not accept friend request by your self",
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const fr = await this.friendShipModel.create({
        user1: new Types.ObjectId(friendRequest.sender),
        user2: new Types.ObjectId(friendRequest.receiver),
      });

      return fr;
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
