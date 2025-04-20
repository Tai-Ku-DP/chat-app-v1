import { IsNotEmpty } from 'class-validator';

export class CreateRequestFriendDto {
  @IsNotEmpty()
  receiverId: string;
}
