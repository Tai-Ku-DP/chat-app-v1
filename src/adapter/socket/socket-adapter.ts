/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Socket, Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { INestApplicationContext } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { IUser } from 'src/schemas/user.schema';
import { SocketAuthGuard } from 'src/guards/socket-auth.guard';
import { SERVICES } from 'src/utils';

export interface AuthenticatedSocket extends Socket {
  user?: IUser;
}

export class SocketAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  private readonly redisService: RedisService;

  private readonly socketAuthGuard: SocketAuthGuard;

  constructor(private readonly app: INestApplicationContext) {
    super(app);

    this.redisService = this.app.get(SERVICES.REDIS_SERVICE);
    this.socketAuthGuard = this.app.get(SocketAuthGuard);
  }

  async connectToRedis(): Promise<void> {
    try {
      const pubClient = this.redisService.getPubClient();
      const subClient = this.redisService.getSubClient();

      // Check if clients are already connected
      if (!pubClient.isOpen) {
        await pubClient.connect();
      }

      if (!subClient.isOpen) {
        await subClient.connect();
      }

      this.adapterConstructor = createAdapter(pubClient, subClient);
    } catch (error) {
      console.error('Error connecting to Redis:', error);
      // Continue without Redis adapter if connection fails
    }
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server: Server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: ['http://localhost:3000'],
        credentials: true,
      },
      pingInterval: 10000,
      pingTimeout: 15000,
      connectTimeout: 45000,
    });

    // Apply Redis adapter if available
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    server.use(async (socket: Socket, next) => {
      const isAuth = await this.socketAuthGuard.canActivate({
        switchToWs: () => ({
          getClient: () => socket,
        }),
      } as any);

      if (!isAuth) return;

      next();
    });

    return server;
  }
}
