import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { FriendRequestModule } from './friend-request/friend-request.module';
import { FriendShipModule } from './friend-ship/friend-ship.module';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { SocketAdapterModule } from './adapter/socket/socket-adapter.module';

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
    RedisModule,
    SocketAdapterModule,
  ],
  providers: [RedisService],
})
export class AppModule {}
