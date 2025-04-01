import { FilterQuery } from 'mongoose';
import { User } from 'src/schemas/user.schema';

export interface IUserService {
  findUser(query: FilterQuery<User>): Promise<User>;
}
