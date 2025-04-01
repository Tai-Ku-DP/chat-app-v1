import { User } from 'src/schemas/user.schema';
import { CreateUserDto } from './dto';

export interface IAuthService {
  createUser(user: CreateUserDto): Promise<User>;
  login(user: User): Promise<{ accessToken: string }>;
  validateUser(payload: IPramsValidateUser): Promise<User>;
  hashPassword(pass: string): Promise<string>;
  comparePassword(params: IParamsComparePassword): Promise<boolean>;
}

export type IParamsComparePassword = {
  rawPassWord: string;
  hashPassword: string;
};

export type IPramsValidateUser = {
  email: string;
  password: string;
};
