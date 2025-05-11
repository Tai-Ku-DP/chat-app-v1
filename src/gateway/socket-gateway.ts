import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      id: string;
      email: string;
    };
  };
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  },
  path: '/socket.io',
  transports: ['websocket', 'polling'],
  allowEIO3: true,
})
export class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  private readonly SOCKET_TTL = 60 * 60; // 1 hour in seconds

  handleConnection(client: AuthenticatedSocket) {
    Logger.log(`Client Redis connected: ${client.id}`);
  }

  handleDisconnect(client: AuthenticatedSocket) {
    Logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit() {
    Logger.log('Socket.io server initialized');
  }
}
