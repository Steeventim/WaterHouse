import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { SmsService } from './sms.service';

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
  phoneNumber: string;
  role?: string;
  name?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class AuthService {
  private readonly store = new Map<string, OtpRecord>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly smsService: SmsService,
  ) {}

  // Réinitialisation OTP par l’admin
  async resetOtp(userId: string) {
    const user = await this.usersService['repo']
      ? await this.usersService['repo'].findOne({ where: { id: userId } })
      : this.usersService.allUsers.find(u => u.id === userId);
    if (!user) throw new BadRequestException('User not found');
    const otp = this.generateOtp();
    const requestId = this.generateRequestId();
    const expiresAt = Date.now() + 5 * 60 * 1000;
    this.store.set(user.phoneNumber, {
      phoneNumber: user.phoneNumber,
      otp,
      requestId,
      expiresAt,
      attempts: 0,
      isUsed: false,
    });
    await this.smsService.sendSms(user.phoneNumber, `Votre nouveau code OTP est : ${otp}`);
    return { success: true, message: 'OTP reset and sent', requestId };
  }

  // Public API - OTP flow
  async sendOtp(phoneNumber: string): Promise<{ success: boolean; message: string; requestId: string; otp?: string }> {
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

    // Envoi OTP via provider SMS (Twilio ou mock)
    const smsRes = await this.smsService.sendSms(phoneNumber, `Votre code OTP est : ${otp}`);
    const baseRes = { success: smsRes.success, message: smsRes.success ? 'OTP sent successfully' : 'OTP failed', requestId };
    if (process.env.NODE_ENV === 'test') {
      return { ...baseRes, otp };
    }
    return baseRes;
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

    // Génère un vrai JWT pour permettre l'accès au profil
    const user = { id: 'user_123', phoneNumber, role: 'collector', name: 'Demo User' };
    const payload = { phoneNumber: user.phoneNumber, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      refreshToken: 'fake-refresh-token',
      user,
      expiresIn: 3600,
    };
  }


  // Plus de login username/password : tout passe par OTP

  async login(user: any): Promise<{ accessToken: string; user: any }> {
    const payload = { phoneNumber: user.phoneNumber, sub: user.id, role: user.role };
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
