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

describe('BiometricKey HTTP (E2E)', () => {
  let app: INestApplication;
  let token: string;
  let userId: string;
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
      .send({ phoneNumber: '+22522223333', name: 'Bio User', role: 'collector' });
    userId = userRes.body.id;
  });
  afterAll(async () => {
    await app.close();
  });
  it('register-bio et verify-bio fonctionnent en HTTP', async () => {
    // Enregistrement d'une clé publique factice
    const publicKey = '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7\n-----END PUBLIC KEY-----';
    const regRes = await request(app.getHttpServer())
      .post('/auth/register-bio')
      .set('Authorization', 'Bearer ' + token)
      .send({ userId, publicKey });
    expect(regRes.status).toBe(201);
    // Vérification (signature factice, attend Forbidden car fausse signature)
    const verifyRes = await request(app.getHttpServer())
      .post('/auth/verify-bio')
      .send({ userId, challenge: 'abc', signature: 'fake' });
    expect([400, 403]).toContain(verifyRes.status);
  });
});
