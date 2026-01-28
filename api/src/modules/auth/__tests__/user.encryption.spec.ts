import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Chiffrement User (name, extension)', () => {
  let service: UsersService;
  let repo: jest.Mocked<Repository<User>>;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: {
          create: jest.fn(),
          save: jest.fn(),
          findOne: jest.fn(),
        } },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('crée un utilisateur avec nom chiffré', async () => {
    const userInput: Partial<User> = {
      phoneNumber: '+225123456789',
      name: 'Secret Name',
      plainName: 'Secret Name',
      decryptName: function () { return this.plainName; },
      decryptPhone: function () { return this.plainPhone; }
    };
    const createdUser: User = {
      id: 'test-id',
      phoneNumber: '+225123456789',
      name: 'Secret Name',
      plainName: 'Secret Name',
      plainPhone: '+225123456789',
      role: 'collector',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      decryptName: function () { return this.plainName; },
      decryptPhone: function () { return this.plainPhone; }
    } as User;
    repo.create.mockReturnValue(createdUser);
    repo.save.mockImplementation(async (u) => ({
      ...u,
      id: u.id || 'test-id',
      role: u.role || 'collector',
      isActive: u.isActive !== undefined ? u.isActive : true,
      createdAt: u.createdAt || new Date(),
      updatedAt: u.updatedAt || new Date(),
      decryptName: function () { return this.plainName; },
      decryptPhone: function () { return this.plainPhone; }
    } as User));
    const saved = await service.create(userInput);
    expect(saved.name).not.toBe('Secret Name');
    expect(saved['name_iv']).toBeDefined();
    expect(saved['name_tag']).toBeDefined();
  });

  it('met à jour le nom et le chiffre', async () => {
    const existingUser: User = {
      id: 'u1',
      phoneNumber: '+225123456789',
      name: undefined,
      plainName: undefined,
      plainPhone: '+225123456789',
      role: 'collector',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      decryptName: function () { return this.plainName; },
      decryptPhone: function () { return this.plainPhone; }
    } as User;
    repo.findOne.mockResolvedValue(existingUser);
    repo.save.mockImplementation(async (u) => ({
      ...u,
      id: u.id || 'test-id',
      role: u.role || 'collector',
      isActive: u.isActive !== undefined ? u.isActive : true,
      createdAt: u.createdAt || new Date(),
      updatedAt: u.updatedAt || new Date(),
      decryptName: function () { return this.plainName; },
      decryptPhone: function () { return this.plainPhone; }
    } as User));
    const updated = await service.update('u1', { name: 'Nouveau Nom' });
    expect(updated.name).not.toBe('Nouveau Nom');
    expect(updated['name_iv']).toBeDefined();
    expect(updated['name_tag']).toBeDefined();
  });
});
