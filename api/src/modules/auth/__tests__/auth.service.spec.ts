import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByPhoneNumber: (phoneNumber: string) => {
      if (phoneNumber === '+225000000000') return Promise.resolve({ id: 'admin', phoneNumber: '+225000000000', role: 'admin', name: 'Admin', isActive: true });
      return Promise.resolve(null);
    },
  };

  const mockJwtService = { sign: () => 'signed-token' };

  beforeEach(() => {
    // Instantiate service directly to avoid Nest DI complexity in unit tests
    service = new (AuthService as any)(mockUsersService, mockJwtService);
  });

  it('should send OTP and return requestId', async () => {
    const res = await service.sendOtp('+2250102030405');
    expect(res).toHaveProperty('requestId');
  });

  it('verifyOtp rejects wrong otp', async () => {
    const { requestId } = await service.sendOtp('+2250102030405');
    await expect(service.verifyOtp('+2250102030405', '000000', requestId)).rejects.toThrow(BadRequestException);
  });


  // Plus de validateUser : login par OTP uniquement

  it('returns token on login', async () => {
    const res = await service.login({ id: 'admin', phoneNumber: '+225000000000', role: 'admin' });
    expect(res.accessToken).toBe('signed-token');
  });
});
