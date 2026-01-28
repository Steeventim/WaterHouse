import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { OtpRequest } from '../entities/otp-request.entity';
import { PinCode } from '../entities/pin-code.entity';

describe('AuthController (PIN)', () => {
  let app: INestApplication;
  let userId: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, OtpRequest, PinCode],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User, OtpRequest, PinCode]),
        AuthModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    // Crée un utilisateur de test
    const res = await request(app.getHttpServer())
      .post('/auth/users')
      .set('Authorization', 'Bearer ' + (await getAdminToken(app)))
      .send({ phoneNumber: '+225000000001', name: 'Test', role: 'collector' });
    userId = res.body.id;
  });
  afterAll(async () => {
    await app.close();
  });
  it('setup-pin et login-pin fonctionnent', async () => {
    // Setup PIN
    const setupRes = await request(app.getHttpServer())
      .post('/auth/setup-pin')
      .set('Authorization', 'Bearer ' + (await getUserToken(app, userId)))
      .send({ pin: '1234' });
    expect(setupRes.status).toBe(201);
    // Login PIN
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login-pin')
      .send({ userId, pin: '1234' });
    expect([200, 201]).toContain(loginRes.status);
    expect(loginRes.body).toHaveProperty('accessToken');
  });
});

// Helpers pour obtenir un token JWT admin/user
async function getAdminToken(app: INestApplication): Promise<string> {
  // Crée un admin si besoin, puis login OTP
  // Pour simplifier, on suppose que l'admin existe déjà avec phone +225000000000
  const phoneNumber = '+225000000000';
  await request(app.getHttpServer()).post('/auth/send-otp').send({ phoneNumber });
  // Récupère le code OTP (mocké)
  const otp = '123456';
  const reqId = 'req_1';
  const res = await request(app.getHttpServer())
    .post('/auth/verify-otp')
    .send({ phoneNumber, otp, requestId: reqId });
  return res.body.accessToken;
}
async function getUserToken(app: INestApplication, userId: string): Promise<string> {
  // Pour le test, on suppose que le user a le phone +225000000001
  const phoneNumber = '+225000000001';
  await request(app.getHttpServer()).post('/auth/send-otp').send({ phoneNumber });
  const otp = '123456';
  const reqId = 'req_1';
  const res = await request(app.getHttpServer())
    .post('/auth/verify-otp')
    .send({ phoneNumber, otp, requestId: reqId });
  return res.body.accessToken;
}
