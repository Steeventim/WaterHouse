import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { OtpRequest } from '../entities/otp-request.entity';
import { UsersService } from '../users.service';

describe('User activation (integration)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userId: string;
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
    // Crée un utilisateur à activer/désactiver
    const createRes = await request(app.getHttpServer())
      .post('/auth/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ phoneNumber: '+225020202020', name: 'User2', role: 'collector' });
    userId = createRes.body.id;
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

  it('should deactivate then activate a user (admin only)', async () => {
    // Désactive
    const deactRes = await request(app.getHttpServer())
      .patch(`/auth/users/${userId}/deactivate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 201]).toContain(deactRes.status);
    expect(deactRes.body.isActive).toBe(false);
    // Active
    const actRes = await request(app.getHttpServer())
      .patch(`/auth/users/${userId}/activate`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect([200, 201]).toContain(actRes.status);
    expect(actRes.body.isActive).toBe(true);
  });

  it('should forbid activation/deactivation for collector', async () => {
    // Désactivation
    const deactRes = await request(app.getHttpServer())
      .patch(`/auth/users/${userId}/deactivate`)
      .set('Authorization', `Bearer ${collectorToken}`);
    expect(deactRes.status).toBe(403);
    // Activation
    const actRes = await request(app.getHttpServer())
      .patch(`/auth/users/${userId}/activate`)
      .set('Authorization', `Bearer ${collectorToken}`);
    expect(actRes.status).toBe(403);
  });
});
