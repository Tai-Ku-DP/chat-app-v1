import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { SERVICES } from 'src/utils';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController],
  providers: [
    {
      provide: SERVICES.USERS,
      useClass: UserService,
    },
  ],
  exports: [
    {
      provide: SERVICES.USERS,
      useClass: UserService,
    },
  ],
})
export class UserModule {}
