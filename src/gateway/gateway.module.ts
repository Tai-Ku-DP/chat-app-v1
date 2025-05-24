import { Module } from '@nestjs/common';
import { SocketGateway } from './socket-gateway';
import { RedisService } from 'src/redis/redis.service';
import { SERVICES } from 'src/utils';

@Module({
  providers: [
    SocketGateway,
    {
      provide: SERVICES.REDIS_SERVICE,
      useClass: RedisService,
    },
  ],
})
export class GatewayModule {}
