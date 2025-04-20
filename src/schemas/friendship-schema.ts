// src/schemas/friend-request.schema.ts
import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema({ versionKey: false })
export class FriendShip extends Document {
  @Prop({ type: Types.ObjectId, ref: () => User, required: true })
  user1: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: () => User, required: true })
  user2: Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FriendShipSchema = SchemaFactory.createForClass(FriendShip);
FriendShipSchema.index({ user1: 1, user2: 1 }, { unique: true });
