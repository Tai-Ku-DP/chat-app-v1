import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from './dto';

export interface IAuthService {
  createUser(user: CreateUserDto): Promise<{ token: string }>;
  login(user: User): Promise<{ token: string }>;
  validateUser(payload: IPramsValidateUser): Promise<User>;
  hashPassword(pass: string): Promise<string>;
  comparePassword(params: IParamsComparePassword): Promise<boolean>;
  signJwt(user: IPramsJwtSign): Promise<{ token: string }>;
}

export type IParamsComparePassword = {
  rawPassWord: string;
  hashPassword: string;
};

export type IPramsValidateUser = {
  email: string;
  password: string;
};

export type IPramsJwtSign = {
  email: string;
  _id: string;
};
