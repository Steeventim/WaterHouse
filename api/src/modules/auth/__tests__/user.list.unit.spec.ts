import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';

describe('UsersService - listing (unit)', () => {
  let service: UsersService;

  beforeEach(() => {
    service = new UsersService();
    // Seed admin et collector
    service.create({
      id: 'admin',
      phoneNumber: '+225000000000',
      role: 'admin',
      name: 'Admin',
      isActive: true,
    });
    service.create({
      id: 'collector',
      phoneNumber: '+225000000001',
      role: 'collector',
      name: 'Collector',
      isActive: true,
    });
  });

  it('retourne tous les utilisateurs (getter allUsers)', () => {
    const users = service.allUsers;
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThanOrEqual(2);
    expect(users.some(u => u.role === 'admin')).toBe(true);
    expect(users.some(u => u.role === 'collector')).toBe(true);
  });

  it('pagine correctement les utilisateurs (paginate)', async () => {
    // Ajoute 18 utilisateurs pour tester la pagination
    for (let i = 2; i < 20; i++) {
      await service.create({
        id: `user${i}`,
        phoneNumber: `+2250000000${i.toString().padStart(2, '0')}`,
        role: 'collector',
        name: `User${i}`,
        isActive: true,
      });
    }
    const page1 = await service.paginate(1, 5);
    expect(page1.items.length).toBe(5);
    expect(page1.total).toBeGreaterThanOrEqual(20);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(5);
    const page2 = await service.paginate(2, 5);
    expect(page2.items.length).toBe(5);
    expect(page2.page).toBe(2);
    // Vérifie que les utilisateurs ne se recoupent pas
    const ids1 = page1.items.map(u => u.id);
    const ids2 = page2.items.map(u => u.id);
    expect(ids1.some(id => ids2.includes(id))).toBe(false);
  });
});
