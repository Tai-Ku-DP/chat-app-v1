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
import { FriendShipModule } from 'src/friend-ship/friend-ship.module';
import { FriendRequestGateway } from './friend-request.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FriendRequest.name, schema: FriendRequestSchema },
    ]),
    UserModule,
    FriendShipModule,
  ],
  controllers: [FriendRequestController],
  providers: [
    FriendRequestGateway,
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
