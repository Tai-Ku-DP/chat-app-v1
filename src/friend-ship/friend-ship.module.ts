import { Module } from '@nestjs/common';
import { FriendShipController } from './friend-ship.controller';
import { FriendShipService } from './friend-ship.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FriendShip, FriendShipSchema } from 'src/schemas/friendship-schema';
import { SERVICES } from 'src/utils';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FriendShip.name, schema: FriendShipSchema },
    ]),
  ],
  controllers: [FriendShipController],
  providers: [
    {
      provide: SERVICES.FRIEND_SHIP_SERVICE,
      useClass: FriendShipService,
    },
  ],
  exports: [
    {
      provide: SERVICES.FRIEND_SHIP_SERVICE,
      useClass: FriendShipService,
    },
  ],
})
export class FriendShipModule {}
