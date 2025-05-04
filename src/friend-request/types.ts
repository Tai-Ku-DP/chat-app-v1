import { FilterQuery } from 'mongoose';
import {
  FriendRequest,
  StatusFriendRequest,
} from 'src/schemas/friend-request-schema';
import { FriendShip } from 'src/schemas/friendship-schema';
import { User } from 'src/schemas/user.schema';
import { IFriendStatus } from 'src/user/types';

export interface IFriendRequestServices {
  findRequestFriend(query: FilterQuery<FriendShip>): Promise<FriendRequest>;
  createRequestFriend(user: User, receiverId: string): Promise<IFriendStatus>;
  getRequestFriend(
    user: User,
    status: StatusFriendRequest,
  ): Promise<FriendRequest[]>;

  acceptRequestFriend(user: User, requestFriendId: string): Promise<boolean>;
  cancelRequestFriend(
    user: User,
    requestFriendId: string,
  ): Promise<IFriendStatus>;
}
