import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';
import { UsersService } from '../users.service';
import { PinCodeService } from '../pin-code.service';
import { BiometricKeyService } from '../biometric-key.service';
import { RefreshTokenService } from '../refresh-token.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { SmsService } from '../sms.service';

// Mock SmsService
class MockSmsService {
  sent: any[] = [];
  async sendSms(phone: string, msg: string) {
    this.sent.push({ phone, msg });
    return { success: true, provider: 'mock', messageId: 'mocked' };
  }
}

// Mock UsersService (in-memory)
class MockUsersService {
  allUsers = [
    { id: 'admin', phoneNumber: '+225000000000', role: 'admin', name: 'Admin', isActive: true },
    { id: 'collector', phoneNumber: '+225000000001', role: 'collector', name: 'Collector', isActive: true },
  ];
}

// Mock JwtAuthGuard
class MockJwtAuthGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['authorization']?.split(' ')[1];
    if (token === 'admin') req.user = { id: 'admin', role: 'admin' };
    else if (token === 'collector') req.user = { id: 'collector', role: 'collector' };
    else req.user = undefined;
    return true;
  }
}

// Mock PinCodeService
class MockPinCodeService {}

// Mock BiometricKeyService
class MockBiometricKeyService {}

// Mock RefreshTokenService
class MockRefreshTokenService {}

describe('POST /auth/users/:id/reset-otp (integration, mock)', () => {
  let app: INestApplication;
  let smsService: MockSmsService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        { provide: UsersService, useClass: MockUsersService },
        { provide: PinCodeService, useClass: MockPinCodeService },
        { provide: BiometricKeyService, useClass: MockBiometricKeyService },
        { provide: RefreshTokenService, useClass: MockRefreshTokenService },
        { provide: JwtService, useValue: { sign: () => 'token', verify: () => ({}) } },
        { provide: SmsService, useClass: MockSmsService },
      ],

    })
      .overrideProvider(SmsService).useClass(MockSmsService)
      .overrideGuard(JwtAuthGuard).useClass(MockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    smsService = app.get(SmsService);
    authService = app.get(AuthService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('réinitialise l’OTP pour un utilisateur existant (admin)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/users/collector/reset-otp')
      .set('Authorization', 'Bearer admin')
      .send();
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toMatch(/OTP reset/);
    expect(typeof res.body.requestId).toBe('string');
    expect(smsService.sent.length).toBe(1);
    expect(smsService.sent[0].phone).toBe('+225000000001');
    expect(smsService.sent[0].msg).toMatch(/OTP/);
  });

  it('retourne 400 si id inconnu', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/users/notfound/reset-otp')
      .set('Authorization', 'Bearer admin')
      .send();
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/User not found/);
  });

  it('refuse la réinitialisation OTP pour collector', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/users/collector/reset-otp')
      .set('Authorization', 'Bearer collector')
      .send();
    expect(res.status).toBe(403);
  });
});
