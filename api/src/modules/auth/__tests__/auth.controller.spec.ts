import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    sendOtp: jest.fn().mockResolvedValue({ success: true, message: 'OTP sent successfully', requestId: 'req_1' }),
    verifyOtp: jest.fn().mockResolvedValue({ accessToken: 'token', user: { id: 'user_123' } }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: 'AuthService', useValue: mockAuthService }],
    })
      .overrideProvider('AuthService')
      .useValue(mockAuthService)
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('sendOtp returns requestId', async () => {
    const res = await controller.sendOtp({ phoneNumber: '+2250102030405' });
    expect(res).toHaveProperty('requestId');
  });

  it('verifyOtp returns token and user', async () => {
    const res = await controller.verifyOtp({ phoneNumber: '+2250102030405', otp: '123456', requestId: 'req_1' });
    expect(res).toHaveProperty('accessToken');
    expect(res.user).toBeDefined();
  });
});
