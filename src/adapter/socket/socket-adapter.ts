/* eslint-disable @typescript-eslint/ban-ts-comment */
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Socket, Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { INestApplicationContext } from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { IUser } from 'src/schemas/user.schema';
import { SocketAuthGuard } from 'src/guards/socket-auth.guard';

export interface AuthenticatedSocket extends Socket {
  user?: IUser;
}

export class SocketAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  private readonly redisService: RedisService;

  private readonly socketAuthGuard: SocketAuthGuard;

  constructor(private readonly app: INestApplicationContext) {
    super(app);

    this.redisService = this.app.get(RedisService);
    this.socketAuthGuard = this.app.get(SocketAuthGuard);
  }

  async connectToRedis(): Promise<void> {
    const pubClient = this.redisService.getPubClient();
    const subClient = this.redisService.getSubClient();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
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
