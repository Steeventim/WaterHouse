import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';

describe('UsersService (integration)', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
  });

  it('crée un utilisateur collector', async () => {
    const user: Partial<User> = {
      name: 'John Doe',
      phoneNumber: '+2250102030405',
      role: 'collector',
      isActive: true,
    };
    const result = await service.create(user);
    expect(result).toBeDefined();
    expect(result.phoneNumber).toBe('+2250102030405');
    expect(result.role).toBe('collector');
    expect(result.isActive).toBe(true);
  });
});