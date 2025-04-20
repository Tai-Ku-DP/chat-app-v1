import { ClientSession } from 'mongoose';
import { FriendRequest } from 'src/schemas/friend-request-schema';
import { FriendShip } from 'src/schemas/friendship-schema';

export interface IFriendShipServices {
  createFriendShip(params: IPramsCreateFriendShip): Promise<FriendShip>;
}

export type IPramsCreateFriendShip = {
  friendRequest: FriendRequest;
  userId: string;
  session?: ClientSession;
};
