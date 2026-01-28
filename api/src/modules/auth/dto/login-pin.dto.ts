import { IsString, IsUUID, Length } from 'class-validator';
export class LoginPinDto {
  @IsUUID()
  userId: string;

  @IsString()
  @Length(4, 8)
  pin: string;
}