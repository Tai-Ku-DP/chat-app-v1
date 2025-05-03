import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Model } from 'mongoose';

@Schema({ versionKey: false })
export class User extends Model {
  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  @Exclude()
  password?: string;
}

export type IUser = User & { _id: string };

export const UserSchema = SchemaFactory.createForClass(User);
