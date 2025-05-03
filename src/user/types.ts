import { FilterQuery } from 'mongoose';
import { StatusFriendRequest } from 'src/schemas/friend-request-schema';
import { User } from 'src/schemas/user.schema';

export interface IUserService {
  findUser(query: FilterQuery<User>, pickPass?: boolean): Promise<User>;
  searchUsersByEmail?(email: string, limit: number): Promise<User[]>;
  searchUsersWithFriendStatus(
    currentUserId: string,
    email: string,
    limit: number,
  ): Promise<UserWithFriendStatus[]>;
}

export interface UserWithFriendStatus {
  user: User;
  friendStatus?: {
    status: StatusFriendRequest;
    requestId?: string;
    isSender?: boolean;
  };
}
