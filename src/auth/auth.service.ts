import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/user.schema';
import {
  IAuthService,
  IParamsComparePassword,
  IPramsJwtSign,
  IPramsValidateUser,
} from './types';
import { CreateUserDto } from './dto';
import { hashPassword } from 'src/utils';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { IUserService } from 'src/user/types';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,

    @Inject(UserService)
    private readonly userService: IUserService,

    private jwtService: JwtService,
  ) {}

  async createUser(user: CreateUserDto): Promise<{ token: string }> {
    const emailExisted = await this.userModel.findOne({ email: user.email });

    if (emailExisted)
      throw new HttpException('Email existed', HttpStatus.CONFLICT);

    const passwordHash = await hashPassword(user.password);

    Object.assign(user, {
      ...user,
      password: passwordHash,
    });

    const createdUser = new this.userModel(user);

    createdUser.save();

    return this.signJwt({
      email: createdUser.email,
      _id: String(createdUser._id),
    });
  }

  async login(user: User) {
    return this.signJwt({ email: user.email, _id: user._id });
  }

  async signJwt(user: IPramsJwtSign) {
    const payload = { email: user.email, id: user._id };

    return {
      token: this.jwtService.sign(payload),
    };
  }

  async validateUser(params: IPramsValidateUser) {
    const { email, password } = params;

    const user = await this.userService.findUser(
      {
        email,
      },
      true,
    );

    const isValidPass = await this.comparePassword({
      rawPassWord: password,
      hashPassword: user.password,
    });

    if (!isValidPass)
      throw new HttpException(
        'Password or Email Wrong',
        HttpStatus.UNAUTHORIZED,
      );

    return user;
  }

  async hashPassword(pass: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(pass, salt);
  }

  async comparePassword({ rawPassWord, hashPassword }: IParamsComparePassword) {
    return await bcrypt.compare(rawPassWord, hashPassword);
  }
}
