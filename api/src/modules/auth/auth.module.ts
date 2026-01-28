import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { OtpRequest } from './entities/otp-request.entity';
import { SmsService } from './sms.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'DEV_SECRET',
      signOptions: { expiresIn: '1h' },
    }),
    TypeOrmModule.forFeature([User, OtpRequest]),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy, SmsService],
  exports: [AuthService, UsersService],
})
export class AuthModule {}
