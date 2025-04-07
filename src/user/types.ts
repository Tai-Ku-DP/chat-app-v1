import { FilterQuery } from 'mongoose';
import { User } from 'src/schemas/user.schema';

export interface IUserService {
  findUser(query: FilterQuery<User>, pickPass?: boolean): Promise<User>;
}
