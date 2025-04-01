import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { Model } from 'mongoose';

@Schema()
export class User extends Model {
  @Prop({ isRequired: true })
  email: string;

  @Prop({ isRequired: true })
  fullName: string;

  @Prop({ isRequired: true })
  @Exclude()
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
