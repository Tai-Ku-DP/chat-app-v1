import { IsMongoId } from 'class-validator';

export class AcceptRequestDto {
  @IsMongoId()
  friendRequestId: string;
}
