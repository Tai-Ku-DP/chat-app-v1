import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/schemas/user.schema';
import { SERVICES } from 'src/utils';
import { UserCtx } from 'src/utils/decorator';
import { IUserService } from './types';

@Controller('user')
export class UserController {
  constructor(
    @Inject(SERVICES.USERS) private readonly userService: IUserService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@UserCtx() user: User) {
    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search')
  async searchUsers(
    @Query('email') email: string,
    @Query('limit') limit: number = 10,
  ) {
    if (!email) {
      throw new HttpException(
        'Email search term is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const safeLimit = Math.min(Number(limit) || 10, 100);

    return this.userService.searchUsersByEmail(email, safeLimit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search-with-status')
  async searchUsersWithStatus(
    @UserCtx() user: User,
    @Query('email') email: string,
    @Query('limit') limit: number = 10,
  ) {
    if (!email) {
      throw new HttpException(
        'Email search term is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    const safeLimit = Math.min(Number(limit) || 10, 100);

    return this.userService.searchUsersWithFriendStatus(
      user._id.toString(),
      email,
      safeLimit,
    );
  }
}
