import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthModule } from '../auth.module';
import { UsersService } from '../users.service';

describe('GET /auth/users (integration)', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let adminToken: string;
  let collectorToken: string;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
    usersService = moduleRef.get(UsersService);

    // Seed admin and collector
    await usersService.create({
      id: 'admin',
      phoneNumber: '+225000000000',
      role: 'admin',
      name: 'Admin',
      isActive: true,
    });
    await usersService.create({
      id: 'collector',
      phoneNumber: '+225000000001',
      role: 'collector',
      name: 'Collector',
      isActive: true,
    });

    // Auth: OTP then JWT (bypass si test-mode)
    const adminRes = await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ phoneNumber: '+225000000000' });
    const adminOtp = adminRes.body.otp || '000000';
    const adminJwtRes = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phoneNumber: '+225000000000', otp: adminOtp, requestId: adminRes.body.requestId });
    adminToken = adminJwtRes.body.token;

    const collectorRes = await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ phoneNumber: '+225000000001' });
    const collectorOtp = collectorRes.body.otp || '000000';
    const collectorJwtRes = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phoneNumber: '+225000000001', otp: collectorOtp, requestId: collectorRes.body.requestId });
    collectorToken = collectorJwtRes.body.token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuse l’accès au listing pour collector', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/users')
      .set('Authorization', `Bearer ${collectorToken}`);
    expect(res.status).toBe(403);
  });

  it('retourne la liste des utilisateurs pour admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/auth/users')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    expect(res.body.some(u => u.role === 'admin')).toBe(true);
    expect(res.body.some(u => u.role === 'collector')).toBe(true);
  });
});
