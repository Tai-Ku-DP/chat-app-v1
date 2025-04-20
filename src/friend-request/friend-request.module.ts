import { Module } from '@nestjs/common';
import { FriendRequestController } from './friend-request.controller';
import { FriendRequestService } from './friend-request.service';
import { SERVICES } from 'src/utils';
import { MongooseModule } from '@nestjs/mongoose';
import {
  FriendRequest,
  FriendRequestSchema,
} from 'src/schemas/friend-request-schema';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FriendRequest.name, schema: FriendRequestSchema },
    ]),
    UserModule,
  ],
  controllers: [FriendRequestController],
  providers: [
    {
      provide: SERVICES.FRIENDS_REQUESTS_SERVICE,
      useClass: FriendRequestService,
    },
  ],

  exports: [
    {
      provide: SERVICES.FRIENDS_REQUESTS_SERVICE,
      useClass: FriendRequestService,
    },
  ],
})
export class FriendRequestModule {}
