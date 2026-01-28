import { IsString, IsUUID } from 'class-validator';
export class VerifyBioDto {
  @IsUUID()
  userId: string;
  @IsString()
  challenge: string;
  @IsString()
  signature: string;
}