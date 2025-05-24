import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SocketAuthGuard } from 'src/guards/socket-auth.guard';
import { RedisService } from 'src/redis/redis.service';
import { SERVICES } from 'src/utils';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '2 days' },
      }),
    }),
  ],
  providers: [
    SocketAuthGuard,
    {
      provide: SERVICES.REDIS_SERVICE,
      useClass: RedisService,
    },
  ],
  exports: [
    SocketAuthGuard,
    {
      provide: SERVICES.REDIS_SERVICE,
      useClass: RedisService,
    },
  ],
})
export class SocketAdapterModule {}
