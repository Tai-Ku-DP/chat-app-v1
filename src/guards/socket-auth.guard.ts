import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class SocketAuthGuard implements CanActivate {
  private readonly logger = new Logger(SocketAuthGuard.name);
  private readonly ttlCache = 15 * 60; // 15ph

  constructor(
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    // private readonly redisService: RedisService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const token = this.extractTokenFromHeader(client);

    if (token === 'undefined') {
      this.logger.log(
        'Token extractTokenFromHeader undefined in SocketAuthGuard',
      );
      return false;
    }

    const cacheUser = await this.redisService.get(`token:${token}`);

    if (cacheUser) {
      client.data.user = cacheUser;
      return true;
    }

    const user = await this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_SECRET,
    });

    if (!user) {
      this.logger.error('Invalid User in SocketAuthGuard');
      return false;
    }

    await this.redisService.set(`token:${token}`, user, this.ttlCache);

    client.data.user = user;

    return true;
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const bearer = client.handshake.headers.authorization as string;
    if (!bearer) return undefined;

    const [type, token] = bearer.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
