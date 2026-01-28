import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Chiffrement User (phoneNumber)', () => {
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

  it('crée un utilisateur avec phoneNumber chiffré', async () => {
    const userInput: Partial<User> = {
      phoneNumber: '+225987654321',
      name: 'Test',
      plainPhone: '+225987654321',
      plainName: 'Test',
      decryptName: function () { return this.plainName; },
      decryptPhone: function () { return this.plainPhone; }
    };
    const createdUser: User = {
      id: 'test-id-phone',
      phoneNumber: '+225987654321',
      name: 'Test',
      plainPhone: '+225987654321',
      plainName: 'Test',
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
    expect(saved.phoneNumber).not.toBe('+225987654321');
    expect(saved['phone_iv']).toBeDefined();
    expect(saved['phone_tag']).toBeDefined();
  });

  it('met à jour le phoneNumber et le chiffre', async () => {
    const existingUser: User = {
      id: 'u2',
      phoneNumber: undefined,
      plainPhone: undefined,
      plainName: undefined,
      name: undefined,
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
    const updated = await service.update('u2', { phoneNumber: '+22511112222' });
    expect(updated.phoneNumber).not.toBe('+22511112222');
    expect(updated['phone_iv']).toBeDefined();
    expect(updated['phone_tag']).toBeDefined();
  });
});
