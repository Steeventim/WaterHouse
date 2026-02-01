import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CatalogService } from './catalog.service';
import { Building } from '../../../../../libs/entities/src/catalog/building.entity';
import { Apartment } from '../../../../../libs/entities/src/catalog/apartment.entity';
import { Meter } from '../../../../../libs/entities/src/catalog/meter.entity';
import { UserAssignment } from '../../../../../libs/entities/src/catalog/user-assignment.entity';
import { Repository } from 'typeorm';

describe('CatalogService', () => {
  let service: CatalogService;
  let buildingRepo: jest.Mocked<Repository<Building>>;
  let apartmentRepo: jest.Mocked<Repository<Apartment>>;
  let meterRepo: jest.Mocked<Repository<Meter>>;
  let userAssignmentRepo: jest.Mocked<Repository<UserAssignment>>;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    buildingRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    apartmentRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    meterRepo = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    } as any;

    userAssignmentRepo = {
      find: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CatalogService,
        { provide: getRepositoryToken(Building), useValue: buildingRepo },
        {
          provide: getRepositoryToken(Apartment),
          useValue: apartmentRepo,
        },
        { provide: getRepositoryToken(Meter), useValue: meterRepo },
        {
          provide: getRepositoryToken(UserAssignment),
          useValue: userAssignmentRepo,
        },
      ],
    }).compile();

    service = module.get<CatalogService>(CatalogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserAssignments', () => {
    it('should return user assignments with buildings and apartments', async () => {
      const now = new Date();
      userAssignmentRepo.find.mockResolvedValue([
        {
          userId: 'user_1',
          buildingId: 'build_1',
          apartmentId: null,
          updatedAt: now,
        } as UserAssignment,
        {
          userId: 'user_1',
          buildingId: null,
          apartmentId: 'apt_1',
          updatedAt: now,
        } as UserAssignment,
      ]);

      const result = await service.getUserAssignments('user_1');

      expect(result).toEqual({
        userId: 'user_1',
        assignedBuildings: ['build_1'],
        assignedApartments: ['apt_1'],
        lastAssignmentUpdate: now.toISOString(),
      });
    });

    it('should return empty assignments when user has none', async () => {
      userAssignmentRepo.find.mockResolvedValue([]);

      const result = await service.getUserAssignments('user_999');

      expect(result).toEqual({
        userId: 'user_999',
        assignedBuildings: [],
        assignedApartments: [],
        lastAssignmentUpdate: null,
      });
    });

    it('should return default values when userId is not provided', async () => {
      const result = await service.getUserAssignments(undefined);

      expect(result).toEqual({
        userId: '',
        assignedBuildings: [],
        assignedApartments: [],
        lastAssignmentUpdate: null,
      });
    });
  });

  describe('syncCatalog', () => {
    it('should sync catalog data for user with building assignments', async () => {
      const lastSync = '2026-01-26T00:00:00Z';
      const syncTime = new Date().toISOString();

      // Mock user assignments
      userAssignmentRepo.find.mockResolvedValue([
        {
          userId: 'user_1',
          buildingId: 'build_1',
          apartmentId: null,
        } as UserAssignment,
      ]);

      // Mock data
      const buildings = [
        {
          id: 'build_1',
          name: 'Building 1',
          address: '123 Main St',
          updatedAt: new Date(syncTime),
        } as Building,
      ];

      const apartments = [
        {
          id: 'apt_1',
          buildingId: 'build_1',
          number: 'A101',
          updatedAt: new Date(syncTime),
        } as Apartment,
      ];

      const meters = [
        {
          id: 'meter_1',
          apartmentId: 'apt_1',
          type: 'electricity',
          serialNumber: 'ELEC001',
          updatedAt: new Date(syncTime),
        } as Meter,
      ];

      mockQueryBuilder.getMany.mockResolvedValueOnce(buildings);
      mockQueryBuilder.getMany.mockResolvedValueOnce(apartments);
      mockQueryBuilder.getMany.mockResolvedValueOnce(meters);

      const result = await service.syncCatalog({
        userId: 'user_1',
        lastSync,
      });

      expect(result.buildings).toEqual(buildings);
      expect(result.apartments).toEqual(apartments);
      expect(result.meters).toEqual(meters);
      expect(result.totalRecords).toBe(3);
      expect(result.syncTimestamp).toBeDefined();
    });

    it('should return empty results when user has no assignments', async () => {
      userAssignmentRepo.find.mockResolvedValue([]);

      mockQueryBuilder.getMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      const result = await service.syncCatalog({
        userId: 'user_999',
      });

      expect(result.buildings).toEqual([]);
      expect(result.apartments).toEqual([]);
      expect(result.meters).toEqual([]);
      expect(result.totalRecords).toBe(0);
    });

    it('should apply lastSync filter when provided', async () => {
      const lastSync = '2026-01-26T00:00:00Z';

      userAssignmentRepo.find.mockResolvedValue([
        {
          userId: 'user_1',
          buildingId: 'build_1',
          apartmentId: null,
        } as UserAssignment,
      ]);

      mockQueryBuilder.getMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      await service.syncCatalog({
        userId: 'user_1',
        lastSync,
      });

      // Verify andWhere was called for date filtering
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('updatedAt >'),
        expect.objectContaining({
          lastSync: expect.any(Date),
        })
      );
    });
  });

  describe('createUserAssignments', () => {
    it('should create assignments for buildings and apartments', async () => {
      userAssignmentRepo.create.mockImplementation((dto) => dto as any);
      userAssignmentRepo.save.mockResolvedValue([] as any);

      const result = await service.createUserAssignments({
        userId: 'user_1',
        buildingIds: ['build_1', 'build_2'],
        apartmentIds: ['apt_1'],
        assignedBy: 'admin_1',
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
      expect(userAssignmentRepo.save).toHaveBeenCalled();
    });

    it('should handle empty assignments', async () => {
      userAssignmentRepo.create.mockImplementation((dto) => dto as any);
      userAssignmentRepo.save.mockResolvedValue([] as any);

      const result = await service.createUserAssignments({
        userId: 'user_1',
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });
  });

  describe('deleteUserAssignments', () => {
    it('should delete assignments for buildings and apartments', async () => {
      userAssignmentRepo.delete.mockResolvedValue({ affected: 1 } as any);

      const result = await service.deleteUserAssignments({
        userId: 'user_1',
        buildingIds: ['build_1'],
        apartmentIds: ['apt_1'],
      });

      expect(result.success).toBe(true);
      expect(result.deleted).toBe(2);
      expect(userAssignmentRepo.delete).toHaveBeenCalledTimes(2);
    });

    it('should fail when no IDs provided', async () => {
      const result = await service.deleteUserAssignments({
        userId: 'user_1',
      });

      expect(result.success).toBe(false);
      expect(userAssignmentRepo.delete).not.toHaveBeenCalled();
    });
  });
});
