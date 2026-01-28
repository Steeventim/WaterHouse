import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OtpRequest } from './entities/otp-request.entity';
import { PinCode } from './entities/pin-code.entity';
import { PinCodeService } from './pin-code.service';
import { BiometricKey } from './entities/biometric-key.entity';
import { BiometricKeyService } from './biometric-key.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { RefreshTokenService } from './refresh-token.service';
import { SmsService } from './sms.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'DEV_SECRET',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User, OtpRequest, PinCode, BiometricKey, RefreshToken]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy, SmsService, PinCodeService, BiometricKeyService, RefreshTokenService],
  exports: [AuthService, UsersService],
})
export class AuthModule {}
