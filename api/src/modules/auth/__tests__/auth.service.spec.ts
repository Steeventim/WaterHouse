import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: JwtService,
          useValue: { sign: () => 'signed-token' },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
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
