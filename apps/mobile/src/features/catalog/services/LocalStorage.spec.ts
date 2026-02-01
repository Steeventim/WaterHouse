/**
 * Unit tests for LocalStorage service
 */

import { LocalStorage } from '../services/LocalStorage';
import { Building, Apartment, Meter } from '../../../common/types/sync.types';

// Mock SQLite
jest.mock('react-native-sqlite-storage', () => ({
  openDatabase: jest.fn(),
  DEBUG: jest.fn(),
  enablePromise: jest.fn(),
}));

import SQLite from 'react-native-sqlite-storage';

describe('LocalStorage', () => {
  let storage: LocalStorage;
  let mockDatabase: { transaction: jest.Mock };

  beforeEach(() => {
    mockDatabase = {
      executeSql: jest.fn(),
      close: jest.fn(),
    };

    (SQLite.openDatabase as jest.Mock).mockResolvedValue(mockDatabase);

    storage = new LocalStorage();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize database successfully', async () => {
      mockDatabase.executeSql.mockResolvedValue({ rows: { length: 0 } });

      await storage.initialize();

      expect(SQLite.openDatabase).toHaveBeenCalledWith({
        name: 'waterhouse_catalog.db',
        location: 'default',
      });
    });

    it('should not reinitialize if already initialized', async () => {
      mockDatabase.executeSql.mockResolvedValue({ rows: { length: 0 } });

      await storage.initialize();
      jest.clearAllMocks();

      await storage.initialize();

      expect(SQLite.openDatabase).not.toHaveBeenCalled();
    });

    it('should handle initialization error gracefully', async () => {
      (SQLite.openDatabase as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await expect(storage.initialize()).rejects.toThrow();
    });
  });

  describe('upsertBuilding', () => {
    beforeEach(async () => {
      mockDatabase.executeSql.mockResolvedValue({ rows: { length: 0 } });
      await storage.initialize();
      jest.clearAllMocks();
    });

    it('should insert or replace a building', async () => {
      const building: Building = {
        id: 'build_123',
        name: 'Immeuble A',
        address: '123 Rue de la Paix',
        managerId: 'user_456',
        createdAt: '2026-01-27T00:00:00Z',
        updatedAt: '2026-01-27T00:00:00Z',
      };

      mockDatabase.executeSql.mockResolvedValue({ rows: { length: 0 } });

      await storage.upsertBuilding(building);

      expect(mockDatabase.executeSql).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO buildings'),
        expect.arrayContaining([
          building.id,
          building.name,
          building.address,
          building.managerId,
        ])
      );
    });
  });

  describe('getLastSyncTimestamp', () => {
    beforeEach(async () => {
      mockDatabase.executeSql.mockResolvedValue({ rows: { length: 0 } });
      await storage.initialize();
      jest.clearAllMocks();
    });

    it('should return last sync timestamp', async () => {
      const timestamp = '2026-01-27T10:00:00Z';
      mockDatabase.executeSql.mockResolvedValue({
        rows: {
          length: 1,
          item: () => ({ value: timestamp }),
        },
      });

      const result = await storage.getLastSyncTimestamp();

      expect(result).toBe(timestamp);
    });

    it('should return null if no timestamp exists', async () => {
      mockDatabase.executeSql.mockResolvedValue({
        rows: { length: 0 },
      });

      const result = await storage.getLastSyncTimestamp();

      expect(result).toBeNull();
    });
  });

  describe('setLastSyncTimestamp', () => {
    beforeEach(async () => {
      mockDatabase.executeSql.mockResolvedValue({ rows: { length: 0 } });
      await storage.initialize();
      jest.clearAllMocks();
    });

    it('should set last sync timestamp', async () => {
      const timestamp = '2026-01-27T10:00:00Z';

      await storage.setLastSyncTimestamp(timestamp);

      expect(mockDatabase.executeSql).toHaveBeenCalledWith(
        expect.stringContaining(
          'INSERT OR REPLACE INTO sync_metadata'
        ),
        expect.arrayContaining(['last_sync_timestamp', timestamp])
      );
    });
  });

  describe('storeCatalogData', () => {
    beforeEach(async () => {
      mockDatabase.executeSql.mockResolvedValue({ rows: { length: 0 } });
      await storage.initialize();
      jest.clearAllMocks();
    });

    it('should store complete catalog data', async () => {
      const catalogData = {
        buildings: [
          {
            id: 'build_123',
            name: 'Immeuble A',
            address: '123 Rue',
            createdAt: '2026-01-27T00:00:00Z',
            updatedAt: '2026-01-27T00:00:00Z',
          } as Building,
        ],
        apartments: [
          {
            id: 'apt_123',
            buildingId: 'build_123',
            number: 'A101',
            createdAt: '2026-01-27T00:00:00Z',
            updatedAt: '2026-01-27T00:00:00Z',
          } as Apartment,
        ],
        meters: [
          {
            id: 'meter_123',
            apartmentId: 'apt_123',
            type: 'electricity' as const,
            serialNumber: 'ELEC001',
            initialReading: 100,
            isActive: true,
            createdAt: '2026-01-27T00:00:00Z',
            updatedAt: '2026-01-27T00:00:00Z',
          } as Meter,
        ],
        syncTimestamp: '2026-01-27T10:00:00Z',
        totalRecords: 3,
      };

      mockDatabase.executeSql.mockResolvedValue({ rows: { length: 0 } });

      await storage.storeCatalogData(catalogData);

      // Should have called executeSql for each building, apartment, meter, and sync timestamp
      expect(mockDatabase.executeSql).toHaveBeenCalledTimes(4);
    });
  });

  describe('clear functionality', () => {
    beforeEach(async () => {
      mockDatabase.executeSql.mockResolvedValue({ rows: { length: 0 } });
      await storage.initialize();
      jest.clearAllMocks();
    });

    it('should clear all data', async () => {
      await storage.clearAll();

      expect(mockDatabase.executeSql).toHaveBeenCalledWith(
        'DELETE FROM meters'
      );
      expect(mockDatabase.executeSql).toHaveBeenCalledWith(
        'DELETE FROM apartments'
      );
      expect(mockDatabase.executeSql).toHaveBeenCalledWith(
        'DELETE FROM buildings'
      );
      expect(mockDatabase.executeSql).toHaveBeenCalledWith(
        'DELETE FROM sync_metadata'
      );
    });
  });

  describe('close', () => {
    beforeEach(async () => {
      mockDatabase.executeSql.mockResolvedValue({ rows: { length: 0 } });
      await storage.initialize();
    });

    it('should close database connection', async () => {
      await storage.close();

      expect(mockDatabase.close).toHaveBeenCalled();
    });
  });
});
