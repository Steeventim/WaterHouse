import { SyncRetryService } from './SyncRetryService';
import { BackgroundSyncService } from './BackgroundSyncService';

// Mock BackgroundSyncService
jest.mock('./BackgroundSyncService');

describe('SyncRetryService', () => {
  beforeEach(() => {
    SyncRetryService.clear();
    jest.clearAllMocks();
  });

  describe('addFailedSync', () => {
    it('should add failed sync with incremented failure count', () => {
      const readingId = 'reading-123';
      const meterCode = 'METER-001';
      const value = 150;
      const reason = 'Network timeout';

      const failure = SyncRetryService.addFailedSync(
        readingId,
        meterCode,
        value,
        reason
      );

      expect(failure.readingId).toBe(readingId);
      expect(failure.meterCode).toBe(meterCode);
      expect(failure.value).toBe(value);
      expect(failure.failureCount).toBe(1);
      expect(failure.failureReason).toBe(reason);
    });

    it('should increment failure count on duplicate', () => {
      const readingId = 'reading-124';

      SyncRetryService.addFailedSync(
        readingId,
        'METER-001',
        150,
        'Error 1'
      );
      const second = SyncRetryService.addFailedSync(
        readingId,
        'METER-001',
        150,
        'Error 2'
      );

      expect(second.failureCount).toBe(2);
    });
  });

  describe('getFailedSyncs', () => {
    it('should return all failed syncs', () => {
      SyncRetryService.addFailedSync('reading-1', 'METER-001', 100, 'Error 1');
      SyncRetryService.addFailedSync('reading-2', 'METER-002', 200, 'Error 2');

      const failures = SyncRetryService.getFailedSyncs();
      expect(failures).toHaveLength(2);
    });
  });

  describe('getFailedSync', () => {
    it('should get specific failed sync', () => {
      const readingId = 'reading-125';
      SyncRetryService.addFailedSync(
        readingId,
        'METER-001',
        150,
        'Network error'
      );

      const failure = SyncRetryService.getFailedSync(readingId);
      expect(failure?.readingId).toBe(readingId);
    });

    it('should return undefined if not found', () => {
      const failure = SyncRetryService.getFailedSync('non-existent');
      expect(failure).toBeUndefined();
    });
  });

  describe('getRetryStatus', () => {
    it('should return retry status for failed sync', () => {
      const readingId = 'reading-126';
      SyncRetryService.addFailedSync(
        readingId,
        'METER-001',
        150,
        'Error'
      );

      const status = SyncRetryService.getRetryStatus(readingId);
      expect(status.isRetrying).toBe(true);
      expect(status.attemptCount).toBe(0);
      expect(status.nextRetryAt).toBeDefined();
    });

    it('should return false for non-existent reading', () => {
      const status = SyncRetryService.getRetryStatus('non-existent');
      expect(status.isRetrying).toBe(false);
      expect(status.attemptCount).toBe(0);
    });
  });

  describe('cancelRetry', () => {
    it('should remove failed sync', () => {
      const readingId = 'reading-127';
      SyncRetryService.addFailedSync(
        readingId,
        'METER-001',
        150,
        'Error'
      );

      SyncRetryService.cancelRetry(readingId);

      expect(SyncRetryService.getFailedSync(readingId)).toBeUndefined();
    });
  });

  describe('retryAllFailedSyncs', () => {
    it('should retry all failed syncs', async () => {
      const mockSyncReadings = jest
        .fn()
        .mockResolvedValue(true);
      (BackgroundSyncService.syncReadings as jest.Mock) = mockSyncReadings;

      SyncRetryService.addFailedSync('reading-1', 'METER-001', 100, 'Error');
      SyncRetryService.addFailedSync('reading-2', 'METER-002', 200, 'Error');

      const successCount = await SyncRetryService.retryAllFailedSyncs();

      expect(successCount).toBe(2);
      expect(mockSyncReadings).toHaveBeenCalled();
    });

    it('should return count of successful retries', async () => {
      const mockSyncReadings = jest
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);
      (BackgroundSyncService.syncReadings as jest.Mock) = mockSyncReadings;

      SyncRetryService.addFailedSync('reading-1', 'METER-001', 100, 'Error');
      SyncRetryService.addFailedSync('reading-2', 'METER-002', 200, 'Error');

      const successCount = await SyncRetryService.retryAllFailedSyncs();

      expect(successCount).toBe(1);
    });
  });

  describe('getStats', () => {
    it('should return service statistics', () => {
      SyncRetryService.addFailedSync('reading-1', 'METER-001', 100, 'Error 1');
      SyncRetryService.addFailedSync('reading-2', 'METER-002', 200, 'Error 1');
      SyncRetryService.addFailedSync('reading-3', 'METER-003', 300, 'Error 2');

      const stats = SyncRetryService.getStats();
      expect(stats.totalFailures).toBe(3);
      expect(stats.totalAttempts).toBe(3); // Each added once
    });
  });

  describe('initialize', () => {
    it('should initialize without error', async () => {
      await expect(SyncRetryService.initialize()).resolves.toBeUndefined();
    });
  });
});
