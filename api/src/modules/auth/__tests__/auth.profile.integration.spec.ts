import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { OtpRequest } from '../entities/otp-request.entity';

describe('AuthController (integration) - profile', () => {
  let app: INestApplication;
  let accessToken: string;
  const phoneNumber = '+2250102030405';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, OtpRequest],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User, OtpRequest]),
        AuthModule,
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should authenticate and access profile', async () => {
    // 1. Demande OTP
    const sendRes = await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ phoneNumber });
    expect([200, 201]).toContain(sendRes.status);
    const requestId = sendRes.body.requestId;
    // 2. Récupère le code OTP (mock ou valeur retournée)
    // Si le backend retourne l'OTP en clair pour les tests, on le prend, sinon fallback '123456'
    const otp = sendRes.body.otp || '123456';
    // 3. Vérifie OTP
    const verifyRes = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phoneNumber, otp, requestId });
    console.log('STATUT VERIFY:', verifyRes.status, 'BODY:', verifyRes.body);
    expect([200, 201]).toContain(verifyRes.status);
    const accessToken = verifyRes.body.accessToken;
    expect(accessToken).toBeDefined();
    // 4. Accède au profil protégé
    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${accessToken}`);
    console.log('PROFILE STATUS:', profileRes.status, 'BODY:', profileRes.body);
    expect(profileRes.status).toBe(200);
    expect(profileRes.body).toHaveProperty('user');
  });
});
