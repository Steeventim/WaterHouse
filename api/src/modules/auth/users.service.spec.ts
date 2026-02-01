import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { EncryptionService } from '../../common/encryption.service';

describe('UsersService - paginateAndFilter', () => {
  let service: UsersService;
  let encryptionService: EncryptionService;

  beforeEach(() => {
    encryptionService = {
      encrypt: (val: string) => ({ cipherText: val, iv: 'iv', tag: 'tag' }),
      decrypt: (val: string) => val,
    } as any;
    service = new UsersService(undefined, encryptionService);
    // Ajout d'utilisateurs de test
    service['users'] = [
      { id: '1', phoneNumber: '+225111', name: 'Alice', role: 'collector', isActive: true, createdAt: new Date(), updatedAt: new Date(), plainName: 'Alice', plainPhone: '+225111' } as User,
      { id: '2', phoneNumber: '+225222', name: 'Bob', role: 'admin', isActive: true, createdAt: new Date(), updatedAt: new Date(), plainName: 'Bob', plainPhone: '+225222' } as User,
      { id: '3', phoneNumber: '+225333', name: 'Charlie', role: 'collector', isActive: false, createdAt: new Date(), updatedAt: new Date(), plainName: 'Charlie', plainPhone: '+225333' } as User,
    ];
  });

  it('retourne tous les utilisateurs paginés', async () => {
    const res = await service.paginateAndFilter({ page: 1, limit: 2 });
    expect(res.items.length).toBe(2);
    expect(res.total).toBe(3);
    expect(res.page).toBe(1);
    expect(res.limit).toBe(2);
  });

  it('filtre par nom', async () => {
    const res = await service.paginateAndFilter({ name: 'Bob' });
    expect(res.items.length).toBe(1);
    expect(res.items[0].name).toBe('Bob');
  });

  it('filtre par numéro de téléphone', async () => {
    const res = await service.paginateAndFilter({ phone: '+225333' });
    expect(res.items.length).toBe(1);
    expect(res.items[0].phoneNumber).toBe('+225333');
  });

  it('filtre par recherche (search)', async () => {
    const res = await service.paginateAndFilter({ search: 'ali' });
    expect(res.items.length).toBe(1);
    expect(res.items[0].name).toBe('Alice');
  });
});
