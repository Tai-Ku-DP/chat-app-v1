import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ROUTES } from 'src/utils';
import { CreateUserDto } from './dto';
import { AuthService } from './auth.service';
import { IAuthService } from './types';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { AnyObject } from 'mongoose';

@Controller(ROUTES.AUTH)
export class AuthController {
  constructor(
    @Inject(AuthService) private readonly authService: IAuthService,
  ) {}

  @Post('register')
  async createUser(@Body() body: CreateUserDto) {
    return this.authService.createUser(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req: AnyObject) {
    return this.authService.login(req?.user);
  }

  @Get('login')
  async get() {
    return 'ping';
  }
}
