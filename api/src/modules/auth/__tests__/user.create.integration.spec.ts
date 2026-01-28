import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { OtpRequest } from '../entities/otp-request.entity';
import { UsersService } from '../users.service';

describe('User creation (integration)', () => {
  let app: INestApplication;
  let adminToken: string;
  const adminPhone = '+225000000000';
  let collectorToken: string;
  const collectorPhone = '+225010101010';

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
    // Force la présence d'un admin en base
    await app.get(UsersService).create({ id: 'admin', phoneNumber: adminPhone, role: 'admin', name: 'Admin', isActive: true });
    // Authentifie admin (OTP flow)
    const sendRes = await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ phoneNumber: adminPhone });
    const otp = sendRes.body.otp || '123456';
    const requestId = sendRes.body.requestId;
    const verifyRes = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phoneNumber: adminPhone, otp, requestId });
    adminToken = verifyRes.body.accessToken;
    // Crée un collector et récupère son token
    const sendRes2 = await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ phoneNumber: collectorPhone });
    const otp2 = sendRes2.body.otp || '123456';
    const requestId2 = sendRes2.body.requestId;
    const verifyRes2 = await request(app.getHttpServer())
      .post('/auth/verify-otp')
      .send({ phoneNumber: collectorPhone, otp: otp2, requestId: requestId2 });
    collectorToken = verifyRes2.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a new user (admin only)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ phoneNumber: '+225010101010', name: 'Test User', role: 'collector' });
    expect([200, 201]).toContain(res.status);
    expect(res.body).toHaveProperty('id');
    expect(res.body.phoneNumber).toBe('+225010101010');
    expect(res.body.name).toBe('Test User');
    expect(res.body.role).toBe('collector');
  });

  it('should forbid user creation for collector', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/users')
      .set('Authorization', `Bearer ${collectorToken}`)
      .send({ phoneNumber: '+225099999999', name: 'Should Fail', role: 'collector' });
    expect(res.status).toBe(403);
  });
});
