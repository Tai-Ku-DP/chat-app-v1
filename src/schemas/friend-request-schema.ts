// src/schemas/friend-request.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

export enum StatusFriendRequest {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  EMPTY_STRING = '',
}

@Schema({ versionKey: false })
export class FriendRequest extends Document {
  @Prop({ type: Types.ObjectId, ref: () => User, required: true })
  sender: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: () => User, required: true })
  receiver: Types.ObjectId;

  @Prop({ required: true, default: StatusFriendRequest.EMPTY_STRING })
  status: StatusFriendRequest;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ type: Date })
  acceptedAt?: Date;

  @Prop({ type: Date })
  rejectedAt?: Date;
}

export const FriendRequestSchema = SchemaFactory.createForClass(FriendRequest);

// Tạo index để tối ưu tìm kiếm yêu cầu
FriendRequestSchema.index({ sender: 1, receiver: 1, status: 1 });
