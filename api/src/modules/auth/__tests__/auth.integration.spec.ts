import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AuthModule } from '../auth.module';
import { SmsService } from '../sms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { OtpRequest } from '../entities/otp-request.entity';

describe('AuthController (integration)', () => {
  let app: INestApplication;
  let smsService: SmsService;

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
    smsService = moduleFixture.get<SmsService>(SmsService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/send-otp should send OTP SMS', async () => {
    const spy = jest.spyOn(smsService, 'sendSms');
    const phoneNumber = '+2250102030405';
    const res = await request(app.getHttpServer())
      .post('/auth/send-otp')
      .send({ phoneNumber });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('requestId');
    expect(spy).toHaveBeenCalledWith(phoneNumber, expect.stringContaining('OTP'));
  });
});
