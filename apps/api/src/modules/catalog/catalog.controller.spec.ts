import { Test, TestingModule } from '@nestjs/testing';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { CatalogSyncData } from '../../../common/types/sync.types';

// Mock CatalogService
const mockCatalogService = {
  findAllMeters: jest.fn(),
  findMeterById: jest.fn(),
  createMeter: jest.fn(),
  updateMeter: jest.fn(),
  deleteMeter: jest.fn(),
  getUserAssignments: jest.fn(),
  createUserAssignments: jest.fn(),
  deleteUserAssignments: jest.fn(),
  syncCatalog: jest.fn(),
};

describe('CatalogController', () => {
  let controller: CatalogController;
  let service: CatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CatalogController],
      providers: [
        {
          provide: CatalogService,
          useValue: mockCatalogService,
        },
      ],
    }).compile();

    controller = module.get<CatalogController>(CatalogController);
    service = module.get<CatalogService>(CatalogService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sync endpoint', () => {
    it('should return catalog sync data', async () => {
      const syncData: CatalogSyncData = {
        buildings: [
          {
            id: 'build_1',
            name: 'Building 1',
            address: '123 Main St',
            createdAt: '2026-01-27T00:00:00Z',
            updatedAt: '2026-01-27T00:00:00Z',
          },
        ],
        apartments: [
          {
            id: 'apt_1',
            buildingId: 'build_1',
            number: 'A101',
            createdAt: '2026-01-27T00:00:00Z',
            updatedAt: '2026-01-27T00:00:00Z',
          },
        ],
        meters: [
          {
            id: 'meter_1',
            apartmentId: 'apt_1',
            type: 'electricity',
            serialNumber: 'ELEC001',
            initialReading: 100,
            isActive: true,
            createdAt: '2026-01-27T00:00:00Z',
            updatedAt: '2026-01-27T00:00:00Z',
          },
        ],
        syncTimestamp: '2026-01-27T10:00:00Z',
        totalRecords: 3,
      };

      mockCatalogService.syncCatalog.mockResolvedValue(syncData);

      const result = await controller.sync({
        lastSync: '2026-01-26T00:00:00Z',
        userId: 'user_1',
      });

      expect(result).toEqual(syncData);
      expect(mockCatalogService.syncCatalog).toHaveBeenCalledWith({
        lastSync: '2026-01-26T00:00:00Z',
        userId: 'user_1',
      });
    });

    it('should handle sync without lastSync parameter', async () => {
      const syncData: CatalogSyncData = {
        buildings: [],
        apartments: [],
        meters: [],
        syncTimestamp: '2026-01-27T10:00:00Z',
        totalRecords: 0,
      };

      mockCatalogService.syncCatalog.mockResolvedValue(syncData);

      const result = await controller.sync({
        userId: 'user_1',
      });

      expect(result).toEqual(syncData);
      expect(mockCatalogService.syncCatalog).toHaveBeenCalledWith({
        userId: 'user_1',
      });
    });
  });

  describe('user-assignments endpoint', () => {
    it('should return user assignments', async () => {
      const assignments = {
        userId: 'user_1',
        assignedBuildings: ['build_1', 'build_2'],
        assignedApartments: ['apt_1'],
        lastAssignmentUpdate: '2026-01-27T10:00:00Z',
      };

      mockCatalogService.getUserAssignments.mockResolvedValue(assignments);

      const result = await controller.userAssignments('user_1');

      expect(result).toEqual(assignments);
      expect(mockCatalogService.getUserAssignments).toHaveBeenCalledWith(
        'user_1'
      );
    });

    it('should create user assignments', async () => {
      const createDto = {
        userId: 'user_1',
        buildingIds: ['build_1'],
        apartmentIds: ['apt_1'],
        assignedBy: 'admin_1',
      };

      const result = {
        success: true,
        count: 2,
      };

      mockCatalogService.createUserAssignments.mockResolvedValue(result);

      const response = await controller.createUserAssignments(createDto);

      expect(response).toEqual(result);
      expect(mockCatalogService.createUserAssignments).toHaveBeenCalledWith(
        createDto
      );
    });

    it('should delete user assignments', async () => {
      const deleteDto = {
        userId: 'user_1',
        buildingIds: ['build_1'],
      };

      const result = {
        success: true,
        deleted: 1,
      };

      mockCatalogService.deleteUserAssignments.mockResolvedValue(result);

      const response = await controller.deleteUserAssignments(deleteDto);

      expect(response).toEqual(result);
      expect(mockCatalogService.deleteUserAssignments).toHaveBeenCalledWith(
        deleteDto
      );
    });
  });

  describe('meters CRUD endpoints', () => {
    it('should get all meters', async () => {
      const meters = [
        {
          id: 'meter_1',
          apartmentId: 'apt_1',
          type: 'electricity',
          serialNumber: 'ELEC001',
          initialReading: 100,
          isActive: true,
          createdAt: '2026-01-27T00:00:00Z',
          updatedAt: '2026-01-27T00:00:00Z',
        },
      ];

      mockCatalogService.findAllMeters.mockResolvedValue(meters);

      const result = await controller.getMeters({});

      expect(result).toEqual(meters);
      expect(mockCatalogService.findAllMeters).toHaveBeenCalled();
    });

    it('should get meter by id', async () => {
      const meter = {
        id: 'meter_1',
        apartmentId: 'apt_1',
        type: 'electricity',
        serialNumber: 'ELEC001',
        initialReading: 100,
        isActive: true,
        createdAt: '2026-01-27T00:00:00Z',
        updatedAt: '2026-01-27T00:00:00Z',
      };

      mockCatalogService.findMeterById.mockResolvedValue(meter);

      const result = await controller.getMeter('meter_1');

      expect(result).toEqual(meter);
      expect(mockCatalogService.findMeterById).toHaveBeenCalledWith('meter_1');
    });

    it('should create meter', async () => {
      const createDto = {
        id: 'meter_1',
        apartmentId: 'apt_1',
        type: 'electricity',
        serialNumber: 'ELEC001',
        initialReading: 100,
      };

      mockCatalogService.createMeter.mockResolvedValue({
        ...createDto,
        isActive: true,
        createdAt: '2026-01-27T00:00:00Z',
        updatedAt: '2026-01-27T00:00:00Z',
      });

      const result = await controller.createMeter(createDto);

      expect(result).toHaveProperty('id', 'meter_1');
      expect(mockCatalogService.createMeter).toHaveBeenCalledWith(createDto);
    });

    it('should update meter', async () => {
      const updateDto = {
        currentReading: 150,
      };

      const updatedMeter = {
        id: 'meter_1',
        apartmentId: 'apt_1',
        type: 'electricity',
        serialNumber: 'ELEC001',
        initialReading: 100,
        currentReading: 150,
        isActive: true,
        createdAt: '2026-01-27T00:00:00Z',
        updatedAt: '2026-01-27T10:00:00Z',
      };

      mockCatalogService.updateMeter.mockResolvedValue(updatedMeter);

      const result = await controller.updateMeter('meter_1', updateDto);

      expect(result).toEqual(updatedMeter);
      expect(mockCatalogService.updateMeter).toHaveBeenCalledWith(
        'meter_1',
        updateDto
      );
    });

    it('should delete meter', async () => {
      const result = { success: true };

      mockCatalogService.deleteMeter.mockResolvedValue(result);

      const response = await controller.deleteMeter('meter_1');

      expect(response).toEqual(result);
      expect(mockCatalogService.deleteMeter).toHaveBeenCalledWith('meter_1');
    });
  });
});
