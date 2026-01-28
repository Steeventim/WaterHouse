import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { OtpRequest } from '../entities/otp-request.entity';
import { PinCode } from '../entities/pin-code.entity';
import { BiometricKey } from '../entities/biometric-key.entity';
import { RefreshToken } from '../entities/refresh-token.entity';

describe('RefreshToken HTTP (E2E)', () => {
  let app: INestApplication;
  let token: string;
  let userId: string;
  let refreshToken: string;
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
      .send({ phoneNumber: '+22599990000', name: 'Refresh User', role: 'collector' });
    userId = userRes.body.id;
  });
  afterAll(async () => {
    await app.close();
  });
  it('issue, refresh et logout du refresh token fonctionnent', async () => {
    // Issue
    const issueRes = await request(app.getHttpServer())
      .post('/auth/refresh-token/issue')
      .set('Authorization', 'Bearer ' + token)
      .send();
    expect(issueRes.status).toBe(201);
    refreshToken = issueRes.body.refreshToken;
    // Refresh
    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .send({ userId, refreshToken });
    expect([200, 201]).toContain(refreshRes.status);
    expect(refreshRes.body).toHaveProperty('accessToken');
    // Logout
    const logoutRes = await request(app.getHttpServer())
      .post('/auth/logout')
      .send({ userId, refreshToken });
    expect(logoutRes.status).toBe(201);
    expect(logoutRes.body.success).toBe(true);
  });
});
