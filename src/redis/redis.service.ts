import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private pubClient: RedisClientType;
  private subClient: RedisClientType;
  constructor() {
    this.pubClient = createClient({
      url: `redis://localhost:6379`,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            this.logger.error('Redis connection failed after 10 retries');
            return new Error('Redis connection failed');
          }
          return Math.min(retries * 100, 3000);
        },
        connectTimeout: 10000,
      },
    });

    this.subClient = this.pubClient.duplicate();

    this.pubClient.on('error', (err) =>
      this.logger.error('Redis Pub Client Error:', err),
    );
    this.subClient.on('error', (err) =>
      this.logger.error('Redis Sub Client Error:', err),
    );
  }

  getPubClient(): RedisClientType {
    return this.pubClient;
  }

  getSubClient(): RedisClientType {
    return this.subClient;
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttlSeconds) {
        await this.pubClient.set(key, stringValue, { EX: ttlSeconds });
      } else {
        await this.pubClient.set(key, stringValue);
      }
    } catch (error) {
      this.logger.error(`Error setting Redis key ${key}:`, error);
      throw error;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.pubClient.get(key);
      return value ? JSON.parse(value.toString()) : null;
    } catch (error) {
      this.logger.error(`Error getting Redis key ${key}:`, error);
      return null;
    }
  }

  async onModuleInit() {
    console.log('RedisModule has been initialized');
  }

  async onModuleDestroy() {
    console.log('RedisModule has been destroyed');
  }
}
