import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/schemas/user.schema';
import { ROUTES, SERVICES } from 'src/utils';
import { UserCtx } from 'src/utils/decorator';
import { CreateRequestFriendDto } from './dto/CreateRequest.dto';
import { IFriendRequestServices } from './types';
import { StatusFriendRequest } from 'src/schemas/friend-request-schema';

@Controller(ROUTES.FRIEND_REQUEST)
export class FriendRequestController {
  constructor(
    @Inject(SERVICES.FRIENDS_REQUESTS_SERVICE)
    private readonly friendRequestService: IFriendRequestServices,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  requestFriend(
    @UserCtx() user: User,
    @Body() { receiverId }: CreateRequestFriendDto,
  ) {
    return this.friendRequestService.createRequestFriend(user, receiverId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getRequestFriend(
    @UserCtx() user: User,
    @Query('status') status: StatusFriendRequest,
  ) {
    return this.friendRequestService.getRequestFriend(user, status);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  acceptRequestFriend(
    @UserCtx() user: User,
    @Param('id') friendRequestId: string,
  ) {
    return this.friendRequestService.acceptRequestFriend(user, friendRequestId);
  }
}
