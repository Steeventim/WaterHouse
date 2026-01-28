import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';

describe('UsersService - update (unit)', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
    service.create({
      id: 'admin',
      phoneNumber: '+225000000000',
      role: 'admin',
      name: 'Admin',
      isActive: true,
    });
  });

  it('modifie le nom et le rôle', async () => {
    const updated = await service.update('admin', { name: 'SuperAdmin', role: 'superadmin' });
    expect(updated.name).toBe('SuperAdmin');
    expect(updated.role).toBe('superadmin');
  });

  it('modifie isActive', async () => {
    const updated = await service.update('admin', { isActive: false });
    expect(updated.isActive).toBe(false);
  });

  it('lance une erreur si id inconnu', async () => {
    await expect(service.update('notfound', { name: 'X' })).rejects.toThrow('User not found');
  });
});
