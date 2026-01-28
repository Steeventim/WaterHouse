import { IsString, IsUUID } from 'class-validator';
export class RegisterBioDto {
  @IsUUID()
  userId: string;
  @IsString()
  publicKey: string;
}