import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

describe('Chiffrement User (intégration CRUD)', () => {
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
          findAndCount: jest.fn(),
        } },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    repo = module.get(getRepositoryToken(User));
  });

  it('crée, lit, met à jour et supprime un utilisateur avec données chiffrées', async () => {
    // Création
    const userInput: Partial<User> = {
      phoneNumber: '+22533334444',
      name: 'Nom Secret',
      role: 'collector',
      plainName: 'Nom Secret',
      plainPhone: '+22533334444',
      decryptName: function () { return this.plainName; },
      decryptPhone: function () { return this.plainPhone; }
    };
    const createdUser: User = {
      id: 'crud-test-id',
      phoneNumber: '+22533334444',
      name: 'Nom Secret',
      role: 'collector',
      plainName: 'Nom Secret',
      plainPhone: '+22533334444',
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
    const created = await service.create(userInput);
    expect(created.name).not.toBe('Nom Secret');
    expect(created.phoneNumber).not.toBe('+22533334444');
    // Lecture (simulate AfterLoad)
    created['name_iv'] && created['name_tag'] && created.decryptName();
    created['phone_iv'] && created['phone_tag'] && created.decryptPhone();
    expect(created.plainName).toBe('Nom Secret');
    expect(created.plainPhone).toBe('+22533334444');
    // Mise à jour
    repo.findOne.mockResolvedValue(created);
    const updated = await service.update(created.id || 'id1', { name: 'Nouveau Nom', phoneNumber: '+22555556666' });
    expect(updated.name).not.toBe('Nouveau Nom');
    expect(updated.phoneNumber).not.toBe('+22555556666');
    updated['name_iv'] && updated['name_tag'] && updated.decryptName();
    updated['phone_iv'] && updated['phone_tag'] && updated.decryptPhone();
    expect(updated.plainName).toBe('Nouveau Nom');
    expect(updated.plainPhone).toBe('+22555556666');
  });
});
