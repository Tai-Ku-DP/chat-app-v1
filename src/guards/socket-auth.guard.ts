import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';
import { IUser } from 'src/schemas/user.schema';
import { PREFIX_REDIS, SERVICES } from 'src/utils';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  private readonly logger = new Logger(SocketAuthGuard.name);
  private readonly ttlCache = 15 * 60; // 15ph

  constructor(
    private readonly jwtService: JwtService,
    @Inject(SERVICES.REDIS_SERVICE) private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHandshake(client);

    if (!token) {
      this.logger.warn('No JWT token provided, disconnecting socket');
      return false;
    }

    // Cố gắng lấy user từ cache Redis
    const cacheUser: IUser = await this.redisService.get(
      `${PREFIX_REDIS.TOKEN}:${token}`,
    );

    if (cacheUser) {
      client.data.user = cacheUser;

      return true;
    }

    // Verify JWT
    let user: IUser;
    try {
      user = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      return false;
    }

    // Lưu vào cache để lần sau không phải verify lại
    await this.redisService.set(`token:${token}`, user, this.ttlCache);

    client.data.user = user;
    return true;
  }

  private extractTokenFromHandshake(client: Socket): string | null {
    // 1. Ưu tiên lấy từ handshake.auth (phổ biến khi dùng Socket.IO >= v3)
    const authToken = (client.handshake.auth &&
      client.handshake.auth.token) as string;

    if (authToken) {
      this.logger.log(`Token from handshake.auth: ${authToken}`);
      return authToken;
    }

    // 2. Fallback: lấy từ header Authorization
    const bearer = client.handshake.headers.authorization as string;
    if (!bearer) return null;

    const [type, token] = bearer.split(' ');
    if (type !== 'Bearer' || !token) {
      this.logger.warn(`Invalid authorization header: ${bearer}`);
      return null;
    }

    return token;
  }
}
