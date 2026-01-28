import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByUsername: (username: string) => {
      if (username === 'admin') return Promise.resolve({ id: 1, username: 'admin', password: 'password', role: 'admin' });
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

  it('validates correct credentials', async () => {
    const user = await service.validateUser('admin', 'password');
    expect(user).toBeDefined();
    expect((user as any).username).toBe('admin');
  });

  it('rejects wrong credentials', async () => {
    const user = await service.validateUser('admin', 'bad');
    expect(user).toBeNull();
  });

  it('returns token on login', async () => {
    const res = await service.login({ id: 1, username: 'admin', role: 'admin' });
    expect(res.accessToken).toBe('signed-token');
  });
});
