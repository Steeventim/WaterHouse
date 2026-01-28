import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../auth.controller';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AuthService } from '../auth.service';

// Mock UsersService (in-memory)
class MockUsersService {
  private _users = [
    { id: 'admin', phoneNumber: '+225000000000', role: 'admin', name: 'Admin', isActive: true },
    { id: 'collector', phoneNumber: '+225000000001', role: 'collector', name: 'Collector', isActive: true },
  ];
  get allUsers() {
    return this._users;
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

// Mock AuthService (non utilisé ici)
class MockAuthService {}

describe('GET /auth/users (integration, mock)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: UsersService, useClass: MockUsersService },
        { provide: AuthService, useClass: MockAuthService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuse l’accès au listing pour collector', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/users')
      .set('Authorization', 'Bearer collector');
    expect(res.status).toBe(403);
  });

  it('retourne la liste des utilisateurs pour admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/users')
      .set('Authorization', 'Bearer admin');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items.length).toBeGreaterThanOrEqual(2);
    expect(res.body.items.some(u => u.role === 'admin')).toBe(true);
    expect(res.body.items.some(u => u.role === 'collector')).toBe(true);
    expect(typeof res.body.total).toBe('number');
    expect(typeof res.body.page).toBe('number');
    expect(typeof res.body.limit).toBe('number');
  });
});
