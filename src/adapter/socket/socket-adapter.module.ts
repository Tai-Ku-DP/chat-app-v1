import { Module } from '@nestjs/common';
import { SocketAuthGuard } from 'src/guards/socket-auth.guard';
import { RedisService } from 'src/redis/redis.service';

@Module({
  providers: [SocketAuthGuard, RedisService],
  exports: [SocketAuthGuard, RedisService],
})
export class SocketAdapterModule {}
