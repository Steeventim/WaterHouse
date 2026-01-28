import { IsString, IsPhoneNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsPhoneNumber()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
