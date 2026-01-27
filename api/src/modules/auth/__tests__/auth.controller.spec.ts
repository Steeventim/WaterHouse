import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: (u: string, p: string) => (u === 'admin' && p === 'password' ? { id: 1, username: 'admin' } : null),
            login: (user: any) => ({ accessToken: 'signed-token', user }),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('returns error on invalid login', async () => {
    const res = await controller.login({ username: 'admin', password: 'bad' } as any);
    expect(res).toEqual({ error: 'Invalid credentials' });
  });

  it('returns token on valid login', async () => {
    const res: any = await controller.login({ username: 'admin', password: 'password' } as any);
    expect(res.accessToken).toBe('signed-token');
    expect(res.user.username).toBe('admin');
  });
});
