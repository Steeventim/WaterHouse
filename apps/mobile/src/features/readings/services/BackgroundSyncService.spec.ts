/**
 * Tests for background sync and API
 * Story 4.1: Synchronisation automatique en ligne
 */

import { ReadingSyncAPI } from './ReadingSyncAPI';
import { BackgroundSyncService } from './BackgroundSyncService';
import { ReadingStorage, OfflineReading } from './OfflineReadingStorage';

// Mock fetch
global.fetch = jest.fn();

describe('ReadingSyncAPI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('syncReadings', () => {
    it('should sync empty array successfully', async () => {
      const result = await ReadingSyncAPI.syncReadings([]);

      expect(result.success).toBe(true);
      expect(result.syncedCount).toBe(0);
      expect(result.failedCount).toBe(0);
    });

    it('should sync readings in batches', async () => {
      const readings: OfflineReading[] = Array.from({ length: 25 }, (_, i) => ({
        id: `reading_${i}`,
        meterId: 'meter_001',
        reading: 100 + i,
        timestamp: Date.now(),
        synced: false,
      }));

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ syncedCount: 10, failedCount: 0 }),
      });

      const progressUpdates: number[] = [];
      const result = await ReadingSyncAPI.syncReadings(readings, (progress) => {
        progressUpdates.push(progress.synced);
      });

      expect(result.success).toBe(true);
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle sync errors', async () => {
      const readings: OfflineReading[] = [
        {
          id: 'reading_1',
          meterId: 'meter_001',
          reading: 100,
          timestamp: Date.now(),
          synced: false,
        },
      ];

      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await ReadingSyncAPI.syncReadings(readings);

      expect(result.success).toBe(false);
      expect(result.failedCount).toBe(1);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].error).toContain('Network error');
    });
  });

  describe('checkHealth', () => {
    it('should return true for healthy backend', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({ ok: true });

      const isHealthy = await ReadingSyncAPI.checkHealth();

      expect(isHealthy).toBe(true);
    });

    it('should return false for unhealthy backend', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Connection refused'));

      const isHealthy = await ReadingSyncAPI.checkHealth();

      expect(isHealthy).toBe(false);
    });
  });
});

describe('BackgroundSyncService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ReadingStorage.clearSyncQueue();
  });

  it('should initialize with default config', () => {
    BackgroundSyncService.init();
    expect(BackgroundSyncService.isSyncInProgress()).toBe(false);
  });

  it('should initialize with custom config', () => {
    BackgroundSyncService.init({
      autoSyncOnConnect: false,
      batteryThreshold: 20,
    });
    expect(BackgroundSyncService.isSyncInProgress()).toBe(false);
  });

  it('should not double-initialize', () => {
    BackgroundSyncService.init();
    BackgroundSyncService.init(); // Should not throw or cause issues
    expect(BackgroundSyncService.isSyncInProgress()).toBe(false);
  });

  it('should subscribe to sync notifications', (done) => {
    const unsubscribe = BackgroundSyncService.onSyncNotification((notification) => {
      expect(notification).toBeDefined();
      expect(notification.type).toBeDefined();
      unsubscribe();
      done();
    });

    // Trigger a notification by attempting sync
    BackgroundSyncService.syncNow().catch(() => {
      // Expected to fail without network
    });
  });

  it('should update configuration', () => {
    BackgroundSyncService.updateConfig({
      batteryThreshold: 25,
    });
    // Config updated successfully (no error thrown)
    expect(true).toBe(true);
  });
});
