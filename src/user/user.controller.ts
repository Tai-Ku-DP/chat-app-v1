import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/schemas/user.schema';
import { UserCtx } from 'src/utils/decorator';

@Controller('user')
export class UserController {
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  getProfile(@UserCtx() user: User) {
    return user;
  }
}
