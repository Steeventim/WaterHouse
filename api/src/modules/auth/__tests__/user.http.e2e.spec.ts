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

describe('User HTTP (chiffrement, E2E)', () => {
  let app: INestApplication;
  let adminToken: string;
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
    adminToken = res.body.accessToken;
  });
  afterAll(async () => {
    await app.close();
  });
  it('crée un utilisateur, lit et vérifie le chiffrement', async () => {
    // Création
    const res = await request(app.getHttpServer())
      .post('/auth/users')
      .set('Authorization', 'Bearer ' + adminToken)
      .send({ phoneNumber: '+22577778888', name: 'Nom HTTP', role: 'collector' });
    expect(res.status).toBe(201);
    userId = res.body.id;
    // Lecture profil (déchiffré)
    const profileRes = await request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', 'Bearer ' + adminToken);
    expect(profileRes.body.user).toBeDefined();
    // Lecture brute en base (chiffré)
    const repo = app.get('UserRepository');
    const user = await repo.findOne({ where: { id: userId } });
    expect(user.name).not.toBe('Nom HTTP');
    expect(user.phoneNumber).not.toBe('+22577778888');
  });
});
