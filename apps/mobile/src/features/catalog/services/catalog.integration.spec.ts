/**
 * Integration tests for the complete sync workflow
 */

import { SyncManager } from '../services/SyncManager';
import { ApiClient } from '../services/ApiClient';
import { LocalStorage } from './LocalStorage';
import { NetworkMonitor } from '../../common/services/NetworkMonitor';
import { CatalogSyncData } from '../../common/types/sync.types';

// Mock dependencies
jest.mock('../services/ApiClient');
jest.mock('./LocalStorage');
jest.mock('../../common/services/NetworkMonitor');

describe('Catalog Sync Integration Tests', () => {
  let syncManager: SyncManager;
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockLocalStorage: jest.Mocked<LocalStorage>;
  let mockNetworkMonitor: jest.Mocked<NetworkMonitor>;

  const testCatalogData: CatalogSyncData = {
    buildings: [
      {
        id: 'build_1',
        name: 'Building 1',
        address: '123 Main St',
        managerId: 'manager_1',
        createdAt: '2026-01-27T00:00:00Z',
        updatedAt: '2026-01-27T00:00:00Z',
      },
      {
        id: 'build_2',
        name: 'Building 2',
        address: '456 Oak Ave',
        createdAt: '2026-01-27T00:00:00Z',
        updatedAt: '2026-01-27T00:00:00Z',
      },
    ],
    apartments: [
      {
        id: 'apt_1',
        buildingId: 'build_1',
        number: 'A101',
        floor: 1,
        tenantName: 'John Doe',
        tenantPhone: '+33123456789',
        createdAt: '2026-01-27T00:00:00Z',
        updatedAt: '2026-01-27T00:00:00Z',
      },
      {
        id: 'apt_2',
        buildingId: 'build_1',
        number: 'A102',
        floor: 1,
        tenantName: 'Jane Smith',
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
        initialReading: 1000,
        currentReading: 1050,
        isActive: true,
        createdAt: '2026-01-27T00:00:00Z',
        updatedAt: '2026-01-27T00:00:00Z',
      },
      {
        id: 'meter_2',
        apartmentId: 'apt_1',
        type: 'water',
        serialNumber: 'WATER001',
        initialReading: 500,
        isActive: true,
        createdAt: '2026-01-27T00:00:00Z',
        updatedAt: '2026-01-27T00:00:00Z',
      },
    ],
    syncTimestamp: '2026-01-27T12:00:00Z',
    totalRecords: 6,
  };

  beforeEach(() => {
    mockApiClient = new ApiClient({
      baseURL: 'http://api.example.com',
    }) as jest.Mocked<ApiClient>;

    mockLocalStorage = new LocalStorage() as jest.Mocked<LocalStorage>;
    mockNetworkMonitor = new NetworkMonitor() as jest.Mocked<
      NetworkMonitor
    >;

    syncManager = new SyncManager(
      mockApiClient,
      mockLocalStorage,
      mockNetworkMonitor
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('complete sync workflow', () => {
    it('should sync all catalog data successfully', async () => {
      // Setup mocks
      mockLocalStorage.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(true);
      mockNetworkMonitor.isOnlineSync = jest.fn().mockReturnValue(true);
      mockLocalStorage.getUserAssignments = jest.fn().mockResolvedValue({
        userId: 'user_1',
        assignedBuildings: ['build_1'],
        assignedApartments: [],
      });
      mockLocalStorage.getLastSyncTimestamp = jest
        .fn()
        .mockResolvedValue(null);
      mockApiClient.getCatalogSync = jest
        .fn()
        .mockResolvedValue(testCatalogData);
      mockLocalStorage.storeCatalogData = jest
        .fn()
        .mockResolvedValue(undefined);

      // Initialize
      await syncManager.initialize();

      // Verify initialization
      expect(mockLocalStorage.initialize).toHaveBeenCalled();
      expect(mockNetworkMonitor.initialize).toHaveBeenCalled();

      // Verify sync was called with correct parameters
      expect(mockApiClient.getCatalogSync).toHaveBeenCalledWith({
        userId: 'user_1',
      });

      // Verify data was stored
      expect(mockLocalStorage.storeCatalogData).toHaveBeenCalledWith(
        testCatalogData
      );
    });

    it('should handle offline mode gracefully', async () => {
      // Setup mocks for offline mode
      mockLocalStorage.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(false);
      mockNetworkMonitor.isOnlineSync = jest.fn().mockReturnValue(false);

      await syncManager.initialize();

      const result = await syncManager.performFullSync();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No network connectivity');
      expect(mockApiClient.getCatalogSync).not.toHaveBeenCalled();
    });

    it('should perform incremental sync with last sync timestamp', async () => {
      const lastSyncTime = '2026-01-26T00:00:00Z';

      // Setup mocks
      mockLocalStorage.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(true);
      mockLocalStorage.getUserAssignments = jest.fn().mockResolvedValue({
        userId: 'user_1',
        assignedBuildings: ['build_1'],
        assignedApartments: [],
      });
      mockLocalStorage.getLastSyncTimestamp = jest
        .fn()
        .mockResolvedValue(lastSyncTime);
      mockApiClient.getCatalogSync = jest
        .fn()
        .mockResolvedValue(testCatalogData);
      mockLocalStorage.storeCatalogData = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await syncManager.performIncrementalSync();

      expect(result.success).toBe(true);
      expect(mockApiClient.getCatalogSync).toHaveBeenCalledWith({
        lastSync: lastSyncTime,
        userId: 'user_1',
      });
    });

    it('should track sync progress through callbacks', async () => {
      const progressStates: any[] = [];
      const progressCallback = jest.fn((progress: any) => {
        progressStates.push(progress);
      });

      // Setup mocks
      mockLocalStorage.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(true);
      mockNetworkMonitor.isOnlineSync = jest.fn().mockReturnValue(true);
      mockLocalStorage.getUserAssignments = jest.fn().mockResolvedValue({
        userId: 'user_1',
        assignedBuildings: [],
        assignedApartments: [],
      });
      mockLocalStorage.getLastSyncTimestamp = jest
        .fn()
        .mockResolvedValue(null);
      mockApiClient.getCatalogSync = jest
        .fn()
        .mockResolvedValue(testCatalogData);
      mockLocalStorage.storeCatalogData = jest
        .fn()
        .mockResolvedValue(undefined);

      syncManager.onSyncProgress(progressCallback);

      await syncManager.initialize();
      await syncManager.performFullSync();

      expect(progressCallback).toHaveBeenCalled();
      expect(progressStates.length).toBeGreaterThan(0);
    });

    it('should handle network state transitions', async () => {
      let networkAvailableCallback: (() => void) | null = null;

      // Setup mocks
      mockLocalStorage.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(false);
      mockNetworkMonitor.isOnlineSync = jest.fn().mockReturnValue(false);

      mockNetworkMonitor.onNetworkAvailable = jest.fn((callback) => {
        networkAvailableCallback = callback;
      });

      mockLocalStorage.getUserAssignments = jest.fn().mockResolvedValue({
        userId: 'user_1',
        assignedBuildings: [],
        assignedApartments: [],
      });
      mockLocalStorage.getLastSyncTimestamp = jest
        .fn()
        .mockResolvedValue(null);
      mockApiClient.getCatalogSync = jest
        .fn()
        .mockResolvedValue(testCatalogData);
      mockLocalStorage.storeCatalogData = jest
        .fn()
        .mockResolvedValue(undefined);

      await syncManager.initialize();

      // Simulate network becoming available
      mockNetworkMonitor.isOnline = jest
        .fn()
        .mockResolvedValue(true);
      mockNetworkMonitor.isOnlineSync = jest.fn().mockReturnValue(true);

      if (networkAvailableCallback) {
        networkAvailableCallback();
      }

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(mockApiClient.getCatalogSync).toHaveBeenCalled();
    });
  });

  describe('data consistency', () => {
    it('should store complete catalog data with all entities', async () => {
      mockLocalStorage.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(true);
      mockLocalStorage.getUserAssignments = jest.fn().mockResolvedValue({
        userId: 'user_1',
        assignedBuildings: [],
        assignedApartments: [],
      });
      mockLocalStorage.getLastSyncTimestamp = jest
        .fn()
        .mockResolvedValue(null);
      mockApiClient.getCatalogSync = jest
        .fn()
        .mockResolvedValue(testCatalogData);
      mockLocalStorage.storeCatalogData = jest
        .fn()
        .mockResolvedValue(undefined);

      await syncManager.performFullSync();

      // Verify all data types were stored
      expect(mockLocalStorage.storeCatalogData).toHaveBeenCalledWith(
        expect.objectContaining({
          buildings: expect.arrayContaining([
            expect.objectContaining({ id: 'build_1' }),
            expect.objectContaining({ id: 'build_2' }),
          ]),
          apartments: expect.arrayContaining([
            expect.objectContaining({ id: 'apt_1' }),
            expect.objectContaining({ id: 'apt_2' }),
          ]),
          meters: expect.arrayContaining([
            expect.objectContaining({ id: 'meter_1' }),
            expect.objectContaining({ id: 'meter_2' }),
          ]),
        })
      );
    });
  });
});
