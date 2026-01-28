import { Test, TestingModule } from '@nestjs/testing';
import { PinCodeService } from '../pin-code.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PinCode } from '../entities/pin-code.entity';
import { User } from '../entities/user.entity';

const mockPinRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};
const mockUserRepo = {
  findOne: jest.fn(),
};

describe('PinCodeService', () => {
  let service: PinCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinCodeService,
        { provide: getRepositoryToken(PinCode), useValue: mockPinRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();
    service = module.get<PinCodeService>(PinCodeService);
    jest.clearAllMocks();
  });

  it('setupPin crée ou met à jour le PIN', async () => {
    mockUserRepo.findOne.mockResolvedValue({ id: 'u1' });
    mockPinRepo.findOne.mockResolvedValue(undefined);
    mockPinRepo.create.mockReturnValue({});
    mockPinRepo.save.mockResolvedValue({});
    const res = await service.setupPin('u1', '1234');
    expect(res.success).toBe(true);
    expect(mockPinRepo.save).toHaveBeenCalled();
  });

  it('verifyPin refuse un mauvais PIN', async () => {
    const salt = 'salt';
    const wrongHash = service['hashPin']('0000', salt);
    const rightHash = service['hashPin']('1234', salt);
    mockPinRepo.findOne.mockResolvedValue({ pinHash: rightHash, salt, user: { id: 'u1' } });
    await expect(service.verifyPin('u1', '0000')).rejects.toThrow();
    await expect(service.verifyPin('u1', '1234')).resolves.toEqual({ success: true });
  });
});
