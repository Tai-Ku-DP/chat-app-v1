import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { FriendShipModule } from './friend-ship/friend-ship.module';
import { RedisService } from './redis/redis.service';

import { SocketAdapterModule } from './adapter/socket/socket-adapter.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SERVICES } from './utils';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env.development',
    }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule,
    UserModule,
    FriendRequestModule,
    FriendShipModule,
    SocketAdapterModule,
    EventEmitterModule.forRoot(),
  ],
  providers: [
    {
      provide: SERVICES.REDIS_SERVICE,
      useClass: RedisService,
    },
  ],
  exports: [
    {
      provide: SERVICES.REDIS_SERVICE,
      useClass: RedisService,
    },
  ],
})
export class AppModule {}
