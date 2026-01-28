import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../auth.controller';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AuthService } from '../auth.service';
import { PinCodeService } from '../pin-code.service';
import { BiometricKeyService } from '../biometric-key.service';
import { RefreshTokenService } from '../refresh-token.service';
import { JwtService } from '@nestjs/jwt';
import { SmsService } from '../sms.service';

// Mock UsersService (in-memory)
class MockUsersService {
  private _users = [
    { id: 'admin', phoneNumber: '+225000000000', role: 'admin', name: 'Admin', isActive: false },
    { id: 'collector', phoneNumber: '+225000000001', role: 'collector', name: 'Collector', isActive: false },
    { id: 'u3', phoneNumber: '+225000000002', role: 'collector', name: 'User3', isActive: false },
  ];
  get allUsers() {
    return this._users;
  }
  async batchSetActive(ids: string[], isActive: boolean) {
    let count = 0;
    for (const id of ids) {
      const user = this._users.find(u => u.id === id);
      if (user) {
        user.isActive = isActive;
        count++;
      }
    }
    return { success: true, count };
  }
}

// Mock JwtAuthGuard
class MockJwtAuthGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();
    // Simule l'utilisateur selon le header Authorization
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

// Mock SmsService
class MockSmsService {}

// Mock AuthService (non utilisé ici)
class MockAuthService {}

describe('PATCH /auth/users/batch-activate & batch-deactivate (integration, mock)', () => {
  let app: INestApplication;
  let usersService: MockUsersService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: UsersService, useClass: MockUsersService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: PinCodeService, useClass: MockPinCodeService },
        { provide: BiometricKeyService, useClass: MockBiometricKeyService },
        { provide: RefreshTokenService, useClass: MockRefreshTokenService },
        { provide: JwtService, useValue: { sign: () => 'token', verify: () => ({}) } },
        { provide: SmsService, useClass: MockSmsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    usersService = moduleRef.get(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('active plusieurs utilisateurs (admin)', async () => {
    // Reset tous inactifs
    usersService.allUsers.forEach(u => (u.isActive = false));
    const res = await request(app.getHttpServer())
      .patch('/auth/users/batch-activate')
      .set('Authorization', 'Bearer admin')
      .send({ ids: ['admin', 'u3'] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(usersService.allUsers.find(u => u.id === 'admin').isActive).toBe(true);
    expect(usersService.allUsers.find(u => u.id === 'u3').isActive).toBe(true);
    expect(usersService.allUsers.find(u => u.id === 'collector').isActive).toBe(false);
  });

  it('désactive plusieurs utilisateurs (admin)', async () => {
    // Met tous actifs
    usersService.allUsers.forEach(u => (u.isActive = true));
    const res = await request(app.getHttpServer())
      .patch('/auth/users/batch-deactivate')
      .set('Authorization', 'Bearer admin')
      .send({ ids: ['admin', 'collector'] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(usersService.allUsers.find(u => u.id === 'admin').isActive).toBe(false);
    expect(usersService.allUsers.find(u => u.id === 'collector').isActive).toBe(false);
    expect(usersService.allUsers.find(u => u.id === 'u3').isActive).toBe(true);
  });

  it('ignore les ids inconnus mais retourne le bon count', async () => {
    usersService.allUsers.forEach(u => (u.isActive = false));
    const res = await request(app.getHttpServer())
      .patch('/auth/users/batch-activate')
      .set('Authorization', 'Bearer admin')
      .send({ ids: ['admin', 'notfound'] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(usersService.allUsers.find(u => u.id === 'admin').isActive).toBe(true);
    expect(usersService.allUsers.find(u => u.id === 'notfound')).toBeUndefined();
  });

  it('refuse l’accès batch pour collector', async () => {
    const res = await request(app.getHttpServer())
      .patch('/auth/users/batch-activate')
      .set('Authorization', 'Bearer collector')
      .send({ ids: ['admin', 'u3'] });
    expect(res.status).toBe(403);
  });
});
