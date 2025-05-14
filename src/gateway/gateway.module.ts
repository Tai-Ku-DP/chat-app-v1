import { Module } from '@nestjs/common';
import { SocketGateway } from './socket-gateway';
import { SERVICES } from 'src/utils';
import { RedisService } from 'src/redis/redis.service';

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
