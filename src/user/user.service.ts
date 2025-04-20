import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { FilterQuery, Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import { IUserService } from './types';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
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
}
