import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { IUser } from 'src/schemas/user.schema';
interface AuthenticatedSocket extends Socket {
  data: {
    user: IUser;
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
export class FriendRequestGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(FriendRequestGateway.name);

  afterInit() {
    this.logger.log('Friend Request Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const userId = client.data.user.id;

      // Join a room with the user's ID
      client.join(userId);

      // Notify client of successful connection
      client.emit('connected', {
        status: 'connected',
        socketId: client.id,
        userId: userId,
      });
    } catch (error) {
      this.logger.error(`Connection error: ${error.message}`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    try {
      const userId = client.data.user.id;

      // Remove socket mapping from Redis
      // await this.redisService.del(`socket:${userId}`);

      // Leave the user's room
      client.leave(userId);

      this.logger.log(`Client disconnected: ${client.id} - User: ${userId}`);
    } catch (error) {
      this.logger.error(`Disconnection error: ${error.message}`);
    }
  }

  // @SubscribeMessage('sendFriendRequest')
  // async handleSendFriendRequest(
  //   @ConnectedSocket() client: AuthenticatedSocket,
  //   @MessageBody() data: { receiverId: string },
  // ) {
  //   try {
  //     const senderId = client.data.user.id;
  //     const receiverId = data.receiverId;

  //     // Store friend request in Redis
  //     const requestKey = `friend_request:${senderId}:${receiverId}`;
  //     await this.redisService.set(requestKey, {
  //       senderId,
  //       receiverId,
  //       status: 'pending',
  //       timestamp: Date.now(),
  //     });

  //     // Get receiver's socket ID from Redis
  //     const receiverSocketId = await this.redisService.get<string>(
  //       `socket:${receiverId}`,
  //     );
  //     if (receiverSocketId) {
  //       this.server.to(receiverSocketId).emit('newFriendRequest', {
  //         senderId,
  //         timestamp: Date.now(),
  //       });
  //     }

  //     return { status: 'success', message: 'Friend request sent' };
  //   } catch (error) {
  //     this.logger.error(`Error sending friend request: ${error.message}`);
  //     return { status: 'error', message: 'Failed to send friend request' };
  //   }
  // }

  // @SubscribeMessage('acceptFriendRequest')
  // async handleAcceptFriendRequest(
  //   @ConnectedSocket() client: AuthenticatedSocket,
  //   @MessageBody() data: { senderId: string },
  // ) {
  //   try {
  //     const receiverId = client.data.user.id;
  //     const senderId = data.senderId;

  //     // Update friend request status in Redis
  //     const requestKey = `friend_request:${senderId}:${receiverId}`;
  //     await this.redisService.set(requestKey, {
  //       senderId,
  //       receiverId,
  //       status: 'accepted',
  //       timestamp: Date.now(),
  //     });

  //     // Get sender's socket ID from Redis
  //     const senderSocketId = await this.redisService.get<string>(
  //       `socket:${senderId}`,
  //     );
  //     if (senderSocketId) {
  //       this.server.to(senderSocketId).emit('friendRequestAccepted', {
  //         receiverId,
  //         timestamp: Date.now(),
  //       });
  //     }

  //     return { status: 'success', message: 'Friend request accepted' };
  //   } catch (error) {
  //     this.logger.error(`Error accepting friend request: ${error.message}`);
  //     return { status: 'error', message: 'Failed to accept friend request' };
  //   }
  // }

  // @SubscribeMessage('rejectFriendRequest')
  // async handleRejectFriendRequest(
  //   @ConnectedSocket() client: AuthenticatedSocket,
  //   @MessageBody() data: { senderId: string },
  // ) {
  //   try {
  //     const receiverId = client.data.user.id;
  //     const senderId = data.senderId;

  //     // Update friend request status in Redis
  //     const requestKey = `friend_request:${senderId}:${receiverId}`;
  //     await this.redisService.set(requestKey, {
  //       senderId,
  //       receiverId,
  //       status: 'rejected',
  //       timestamp: Date.now(),
  //     });

  //     // Get sender's socket ID from Redis
  //     const senderSocketId = await this.redisService.get<string>(
  //       `socket:${senderId}`,
  //     );
  //     if (senderSocketId) {
  //       this.server.to(senderSocketId).emit('friendRequestRejected', {
  //         receiverId,
  //         timestamp: Date.now(),
  //       });
  //     }

  //     return { status: 'success', message: 'Friend request rejected' };
  //   } catch (error) {
  //     this.logger.error(`Error rejecting friend request: ${error.message}`);
  //     return { status: 'error', message: 'Failed to reject friend request' };
  //   }
  // }

  // @SubscribeMessage('getPendingRequests')
  // async handleGetPendingRequests(
  //   @ConnectedSocket() client: AuthenticatedSocket,
  // ) {
  //   try {
  //     const userId = client.data.user.id;
  //     const pattern = `friend_request:*:${userId}`;

  //     // Get all pending requests from Redis
  //     const keys = await this.redisService.getKeys(pattern);
  //     const requests = await Promise.all(
  //       keys.map(async (key) => {
  //         const request = await this.redisService.get<{
  //           senderId: string;
  //           receiverId: string;
  //           status: string;
  //           timestamp: number;
  //         }>(key);
  //         if (request && request.status === 'pending') {
  //           return request;
  //         }
  //         return null;
  //       }),
  //     );

  //     return {
  //       status: 'success',
  //       requests: requests.filter(Boolean),
  //     };
  //   } catch (error) {
  //     this.logger.error(`Error getting pending requests: ${error.message}`);
  //     return { status: 'error', message: 'Failed to get pending requests' };
  //   }
  // }
}
