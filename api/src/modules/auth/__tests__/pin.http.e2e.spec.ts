import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { PinCode } from '../entities/pin-code.entity';
import { OtpRequest } from '../entities/otp-request.entity';
import { BiometricKey } from '../entities/biometric-key.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

describe('PinCode HTTP (E2E)', () => {
  let app: INestApplication;
  let userId: string;
  let token: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, OtpRequest, PinCode, BiometricKey, RefreshToken],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User, OtpRequest, PinCode, BiometricKey, RefreshToken]),
        AuthModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    // Crée un admin et récupère son token
    await request(app.getHttpServer()).post('/auth/send-otp').send({ phoneNumber: '+225000000000' });
    const otp = '123456';
    const reqId = 'req_1';
    const res = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phoneNumber: '+225000000000', otp, requestId: reqId });
    token = res.body.accessToken;
    // Crée un utilisateur
    const userRes = await request(app.getHttpServer())
      .post('/auth/users')
      .set('Authorization', 'Bearer ' + token)
      .send({ phoneNumber: '+22588889999', name: 'PIN User', role: 'collector' });
    userId = userRes.body.id;
  });
  afterAll(async () => {
    await app.close();
  });
  it('setup-pin et login-pin fonctionnent en HTTP', async () => {
    // Setup PIN
    const setupRes = await request(app.getHttpServer())
      .post('/auth/setup-pin')
      .set('Authorization', 'Bearer ' + token)
      .send({ pin: '4321' });
    expect(setupRes.status).toBe(201);
    // Login PIN
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login-pin')
      .send({ userId, pin: '4321' });
    expect([200, 201]).toContain(loginRes.status);
    expect(loginRes.body).toHaveProperty('accessToken');
  });
});
