/**
 * Unit tests for SyncManager service
 */

import { SyncManager } from '../services/SyncManager';
import { ApiClient } from '../services/ApiClient';
import { LocalStorage } from './LocalStorage';
import { NetworkMonitor } from '../../../common/services/NetworkMonitor';
import { CatalogSyncData } from '../../../common/types/sync.types';

// Mock dependencies
jest.mock('../services/ApiClient');
jest.mock('./LocalStorage');
jest.mock('../../common/services/NetworkMonitor');

describe('SyncManager', () => {
  let syncManager: SyncManager;
  let mockApiClient: jest.Mocked<ApiClient>;
  let mockLocalStorage: jest.Mocked<LocalStorage>;
  let mockNetworkMonitor: jest.Mocked<NetworkMonitor>;

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

  describe('initialization', () => {
    it('should initialize all dependencies', async () => {
      mockLocalStorage.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.initialize = jest.fn().mockResolvedValue(undefined);
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(true);
      mockLocalStorage.getUserAssignments = jest.fn().mockResolvedValue({
        userId: 'user_123',
        assignedBuildings: [],
        assignedApartments: [],
      });
      mockApiClient.getCatalogSync = jest.fn().mockResolvedValue({
        buildings: [],
        apartments: [],
        meters: [],
        syncTimestamp: '2026-01-27T10:00:00Z',
        totalRecords: 0,
      });
      mockLocalStorage.storeCatalogData = jest
        .fn()
        .mockResolvedValue(undefined);

      await syncManager.initialize();

      expect(mockLocalStorage.initialize).toHaveBeenCalled();
      expect(mockNetworkMonitor.initialize).toHaveBeenCalled();
    });
  });

  describe('performFullSync', () => {
    beforeEach(() => {
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(true);
      mockLocalStorage.getUserAssignments = jest.fn().mockResolvedValue({
        userId: 'user_123',
        assignedBuildings: [],
        assignedApartments: [],
      });
    });

    it('should perform full synchronization successfully', async () => {
      const syncData: CatalogSyncData = {
        buildings: [
          {
            id: 'build_123',
            name: 'Immeuble A',
            address: '123 Rue',
            createdAt: '2026-01-27T00:00:00Z',
            updatedAt: '2026-01-27T00:00:00Z',
          },
        ],
        apartments: [],
        meters: [],
        syncTimestamp: '2026-01-27T10:00:00Z',
        totalRecords: 1,
      };

      mockLocalStorage.getLastSyncTimestamp = jest
        .fn()
        .mockResolvedValue(null);
      mockApiClient.getCatalogSync = jest.fn().mockResolvedValue(syncData);
      mockLocalStorage.storeCatalogData = jest
        .fn()
        .mockResolvedValue(undefined);

      const result = await syncManager.performFullSync();

      expect(result.success).toBe(true);
      expect(result.recordsSynced).toBe(1);
      expect(mockApiClient.getCatalogSync).toHaveBeenCalled();
      expect(mockLocalStorage.storeCatalogData).toHaveBeenCalledWith(syncData);
    });

    it('should not allow concurrent syncs', async () => {
      mockLocalStorage.getLastSyncTimestamp = jest
        .fn()
        .mockResolvedValue(null);
      mockApiClient.getCatalogSync = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 1000))
      );
      mockLocalStorage.storeCatalogData = jest
        .fn()
        .mockResolvedValue(undefined);

      // Start first sync
      const sync1 = syncManager.performFullSync();

      // Try to start second sync while first is in progress
      const sync2 = syncManager.performFullSync();

      const results = await Promise.all([sync1, sync2]);

      // Second sync should fail
      expect(results[1].success).toBe(false);
      expect(results[1].error).toContain('already in progress');
    });

    it('should handle network offline error', async () => {
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(false);

      const result = await syncManager.performFullSync();

      expect(result.success).toBe(false);
      expect(result.error).toContain('No network connectivity');
    });

    it('should handle missing user ID error', async () => {
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(true);
      mockLocalStorage.getUserAssignments = jest
        .fn()
        .mockResolvedValue(null);

      const result = await syncManager.performFullSync();

      expect(result.success).toBe(false);
      expect(result.error).toContain('User ID not available');
    });

    it('should handle API errors', async () => {
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(true);
      mockLocalStorage.getLastSyncTimestamp = jest
        .fn()
        .mockResolvedValue(null);
      mockApiClient.getCatalogSync = jest
        .fn()
        .mockRejectedValue(new Error('API error'));

      const result = await syncManager.performFullSync();

      expect(result.success).toBe(false);
      expect(result.error).toContain('API error');
    });
  });

  describe('getSyncProgress', () => {
    it('should return current sync progress', async () => {
      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(true);
      mockLocalStorage.getLastSyncTimestamp = jest
        .fn()
        .mockResolvedValue('2026-01-27T10:00:00Z');

      const progress = await syncManager.getSyncProgress();

      expect(progress.isOnline).toBe(true);
      expect(progress.isSyncing).toBe(false);
      expect(progress.lastSyncTime).toBeDefined();
    });
  });

  describe('callback management', () => {
    it('should call sync progress callbacks', async () => {
      const callback = jest.fn();
      syncManager.onSyncProgress(callback);

      mockNetworkMonitor.isOnline = jest.fn().mockResolvedValue(true);
      mockLocalStorage.getUserAssignments = jest.fn().mockResolvedValue({
        userId: 'user_123',
        assignedBuildings: [],
        assignedApartments: [],
      });
      mockLocalStorage.getLastSyncTimestamp = jest
        .fn()
        .mockResolvedValue(null);
      mockApiClient.getCatalogSync = jest.fn().mockResolvedValue({
        buildings: [],
        apartments: [],
        meters: [],
        syncTimestamp: '2026-01-27T10:00:00Z',
        totalRecords: 0,
      });
      mockLocalStorage.storeCatalogData = jest
        .fn()
        .mockResolvedValue(undefined);

      await syncManager.performFullSync();

      expect(callback).toHaveBeenCalled();
    });

    it('should remove sync progress callback', async () => {
      const callback = jest.fn();
      syncManager.onSyncProgress(callback);
      syncManager.offSyncProgress(callback);

      // Should not be called after removal
      expect(
        syncManager['syncProgressCallbacks'].includes(callback)
      ).toBe(false);
    });
  });

  describe('auth token management', () => {
    it('should set auth token in API client', () => {
      mockApiClient.setAuthToken = jest.fn();

      syncManager.setAuthToken('token_123');

      expect(mockApiClient.setAuthToken).toHaveBeenCalledWith('token_123');
    });

    it('should remove auth token from API client', () => {
      mockApiClient.removeAuthToken = jest.fn();

      syncManager.removeAuthToken();

      expect(mockApiClient.removeAuthToken).toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('should clean up resources', async () => {
      mockNetworkMonitor.destroy = jest.fn();
      mockLocalStorage.close = jest.fn().mockResolvedValue(undefined);

      await syncManager.destroy();

      expect(mockNetworkMonitor.destroy).toHaveBeenCalled();
      expect(mockLocalStorage.close).toHaveBeenCalled();
    });
  });
});
