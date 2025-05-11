import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { SERVICES } from 'src/utils';

@Module({
  providers: [
    {
      provide: SERVICES.REDIS_SERVICE,
      useValue: RedisService,
    },
  ],
  exports: [
    {
      provide: SERVICES.REDIS_SERVICE,
      useValue: RedisService,
    },
  ],
})
export class RedisModule {}
