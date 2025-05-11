import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.log('RedisModule has been initialized');
  }

  async onModuleDestroy() {
    console.log('RedisModule has been destroyed');
  }
}
