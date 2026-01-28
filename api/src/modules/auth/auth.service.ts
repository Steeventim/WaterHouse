import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';

type OtpRecord = {
  phoneNumber: string;
  otp: string;
  requestId: string;
  expiresAt: number;
  attempts: number;
  isUsed: boolean;
};

interface User {
  id: string;
  username?: string;
  phoneNumber?: string;
  role?: string;
  name?: string;
  password?: string;
}

@Injectable()
export class AuthService {
  private readonly store = new Map<string, OtpRecord>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Public API - OTP flow
  async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string; requestId: string }> {
    const otp = this.generateOtp();
    const requestId = this.generateRequestId();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    const record: OtpRecord = {
      phoneNumber,
      otp,
      requestId,
      expiresAt,
      attempts: 0,
      isUsed: false,
    };

    this.store.set(requestId, record);

    // TODO: integrate Africa's Talking SMS provider here
    return { success: true, message: 'OTP sent successfully', requestId };
  }

  async verifyOtp(phoneNumber: string, otp: string, requestId: string): Promise<any> {
    const rec = this.store.get(requestId);
    if (!rec) {
      throw new BadRequestException({ error: { code: 'INVALID_REQUEST', message: 'Request not found' } });
    }
    if (rec.isUsed) {
      throw new BadRequestException({ error: { code: 'INVALID_OTP', message: 'Code already used' } });
    }
    if (rec.phoneNumber !== phoneNumber) {
      throw new BadRequestException({ error: { code: 'INVALID_REQUEST', message: 'Phone mismatch' } });
    }
    if (Date.now() > rec.expiresAt) {
      throw new BadRequestException({ error: { code: 'OTP_EXPIRED', message: "Code OTP expiré, veuillez en demander un nouveau" } });
    }
    if (rec.attempts >= 3) {
      throw new BadRequestException({ error: { code: 'TOO_MANY_ATTEMPTS', message: 'Trop de tentatives, veuillez demander un nouveau code' } });
    }

    rec.attempts += 1;
    if (rec.otp !== otp) {
      this.store.set(requestId, rec);
      throw new BadRequestException({ error: { code: 'INVALID_OTP', message: 'Code OTP invalide' } });
    }

    rec.isUsed = true;
    this.store.set(requestId, rec);

    // Simulate token generation; replace with real JWT claims in production
    return {
      accessToken: 'fake-access-token',
      refreshToken: 'fake-refresh-token',
      user: { id: 'user_123', phoneNumber, role: 'collector', name: 'Demo User' },
      expiresIn: 3600,
    };
  }

  // Public API - classic username/password flows (supporting future expansion)
  async validateUser(username: string, pass: string): Promise<Partial<User> | null> {
    const user = await this.usersService.findByUsername(username);
    if (user && user.password === pass) {
      const { password, ...rest } = user as any;
      return rest;
    }
    return null;
  }

  async login(user: any): Promise<{ accessToken: string; user: any }> {
    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }

  // Private helpers
  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  }
}
