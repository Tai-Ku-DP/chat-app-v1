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

  async findUser(query: FilterQuery<User>) {
    const user = await this.userModel.findOne(query, { __v: 0 });

    if (!user) throw new HttpException('User Not Found', HttpStatus.NOT_FOUND);

    return user;
  }
}
