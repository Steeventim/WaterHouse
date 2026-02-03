import { SyncStatusService } from './SyncStatusService';

describe('SyncStatusService', () => {
  beforeEach(() => {
    SyncStatusService.clear();
  });

  describe('addToQueue', () => {
    it('should add item to queue with pending status', () => {
      const item = SyncStatusService.addToQueue('reading-123', 'METER-001');

      expect(item.readingId).toBe('reading-123');
      expect(item.meterCode).toBe('METER-001');
      expect(item.status).toBe('pending');
      expect(item.retryCount).toBe(0);
    });

    it('should generate unique IDs', () => {
      const item1 = SyncStatusService.addToQueue('reading-1', 'METER-001');
      const item2 = SyncStatusService.addToQueue('reading-2', 'METER-002');

      expect(item1.id).not.toBe(item2.id);
    });
  });

  describe('updateQueueItemStatus', () => {
    it('should update item status', () => {
      const item = SyncStatusService.addToQueue('reading-123', 'METER-001');

      SyncStatusService.updateQueueItemStatus(item.id, 'syncing');

      const updated = SyncStatusService.getQueueItem(item.id);
      expect(updated?.status).toBe('syncing');
    });

    it('should add error message when provided', () => {
      const item = SyncStatusService.addToQueue('reading-123', 'METER-001');

      SyncStatusService.updateQueueItemStatus(
        item.id,
        'failed',
        'Network error'
      );

      const updated = SyncStatusService.getQueueItem(item.id);
      expect(updated?.error).toBe('Network error');
    });

    it('should add to history when status is terminal', () => {
      const item = SyncStatusService.addToQueue('reading-123', 'METER-001');

      SyncStatusService.updateQueueItemStatus(item.id, 'success');

      const history = SyncStatusService.getHistory();
      expect(history).toHaveLength(1);
      expect(history[0].status).toBe('success');
    });
  });

  describe('getQueue', () => {
    it('should return all queue items', () => {
      SyncStatusService.addToQueue('reading-1', 'METER-001');
      SyncStatusService.addToQueue('reading-2', 'METER-002');
      SyncStatusService.addToQueue('reading-3', 'METER-003');

      const queue = SyncStatusService.getQueue();
      expect(queue).toHaveLength(3);
    });
  });

  describe('incrementRetryCount', () => {
    it('should increment retry count', () => {
      const item = SyncStatusService.addToQueue('reading-123', 'METER-001');

      SyncStatusService.incrementRetryCount(item.id);
      SyncStatusService.incrementRetryCount(item.id);

      const updated = SyncStatusService.getQueueItem(item.id);
      expect(updated?.retryCount).toBe(2);
    });
  });

  describe('removeFromQueue', () => {
    it('should remove item from queue', () => {
      const item = SyncStatusService.addToQueue('reading-123', 'METER-001');

      SyncStatusService.removeFromQueue(item.id);

      expect(SyncStatusService.getQueueItem(item.id)).toBeUndefined();
    });
  });

  describe('clearCompletedItems', () => {
    it('should remove completed items from queue', () => {
      const item1 = SyncStatusService.addToQueue('reading-1', 'METER-001');
      const item2 = SyncStatusService.addToQueue('reading-2', 'METER-002');
      const item3 = SyncStatusService.addToQueue('reading-3', 'METER-003');

      SyncStatusService.updateQueueItemStatus(item1.id, 'success');
      SyncStatusService.updateQueueItemStatus(item2.id, 'failed');

      SyncStatusService.clearCompletedItems();

      const queue = SyncStatusService.getQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(item3.id);
    });
  });

  describe('getHistory', () => {
    it('should return sync history', () => {
      const item1 = SyncStatusService.addToQueue('reading-1', 'METER-001');
      const item2 = SyncStatusService.addToQueue('reading-2', 'METER-002');

      SyncStatusService.updateQueueItemStatus(item1.id, 'success');
      SyncStatusService.updateQueueItemStatus(item2.id, 'failed');

      const history = SyncStatusService.getHistory();
      expect(history).toHaveLength(2);
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        const item = SyncStatusService.addToQueue(`reading-${i}`, `METER-${i}`);
        SyncStatusService.updateQueueItemStatus(item.id, 'success');
      }

      const history = SyncStatusService.getHistory(5);
      expect(history).toHaveLength(5);
    });

    it('should limit total history to 100 items', () => {
      for (let i = 0; i < 110; i++) {
        const item = SyncStatusService.addToQueue(`reading-${i}`, `METER-${i}`);
        SyncStatusService.updateQueueItemStatus(item.id, 'success');
      }

      const history = SyncStatusService.getHistory(150);
      expect(history.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getHistoryByReading', () => {
    it('should return history for specific reading', () => {
      const item1 = SyncStatusService.addToQueue('reading-123', 'METER-001');
      const item2 = SyncStatusService.addToQueue('reading-124', 'METER-002');

      SyncStatusService.updateQueueItemStatus(item1.id, 'success');
      SyncStatusService.updateQueueItemStatus(item2.id, 'success');

      const history = SyncStatusService.getHistoryByReading('reading-123');
      expect(history).toHaveLength(1);
      expect(history[0].readingId).toBe('reading-123');
    });
  });

  describe('getStats', () => {
    it('should calculate correct statistics', () => {
      const item1 = SyncStatusService.addToQueue('reading-1', 'METER-001');
      const item2 = SyncStatusService.addToQueue('reading-2', 'METER-002');
      const item3 = SyncStatusService.addToQueue('reading-3', 'METER-003');

      SyncStatusService.updateQueueItemStatus(item1.id, 'success');
      SyncStatusService.updateQueueItemStatus(item2.id, 'failed');

      const stats = SyncStatusService.getStats();
      expect(stats.totalItems).toBe(3);
      expect(stats.successfulItems).toBe(1);
      expect(stats.failedItems).toBe(1);
      expect(stats.pendingItems).toBe(1);
    });

    it('should calculate success rate', () => {
      const item1 = SyncStatusService.addToQueue('reading-1', 'METER-001');
      const item2 = SyncStatusService.addToQueue('reading-2', 'METER-002');

      SyncStatusService.updateQueueItemStatus(item1.id, 'success');
      SyncStatusService.updateQueueItemStatus(item2.id, 'success');

      const stats = SyncStatusService.getStats();
      expect(stats.successRate).toBe(100);
    });

    it('should calculate average sync time', () => {
      const item1 = SyncStatusService.addToQueue('reading-1', 'METER-001');
      const item2 = SyncStatusService.addToQueue('reading-2', 'METER-002');

      SyncStatusService.updateQueueItemStatus(item1.id, 'success');
      SyncStatusService.updateQueueItemStatus(item2.id, 'success');

      const stats = SyncStatusService.getStats();
      expect(stats.averageSyncTime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getProgress', () => {
    it('should return 100% when queue is empty', () => {
      const progress = SyncStatusService.getProgress();
      expect(progress).toBe(100);
    });

    it('should calculate progress correctly', () => {
      const item1 = SyncStatusService.addToQueue('reading-1', 'METER-001');
      const item2 = SyncStatusService.addToQueue('reading-2', 'METER-002');

      SyncStatusService.updateQueueItemStatus(item1.id, 'success');

      const progress = SyncStatusService.getProgress();
      expect(progress).toBe(50);
    });
  });

  describe('getFailedItems', () => {
    it('should return only failed items', () => {
      const item1 = SyncStatusService.addToQueue('reading-1', 'METER-001');
      const item2 = SyncStatusService.addToQueue('reading-2', 'METER-002');
      const item3 = SyncStatusService.addToQueue('reading-3', 'METER-003');

      SyncStatusService.updateQueueItemStatus(item1.id, 'success');
      SyncStatusService.updateQueueItemStatus(item2.id, 'failed');

      const failed = SyncStatusService.getFailedItems();
      expect(failed).toHaveLength(1);
      expect(failed[0].id).toBe(item2.id);
    });
  });

  describe('getActiveItems', () => {
    it('should return pending and syncing items', () => {
      const item1 = SyncStatusService.addToQueue('reading-1', 'METER-001');
      const item2 = SyncStatusService.addToQueue('reading-2', 'METER-002');
      const item3 = SyncStatusService.addToQueue('reading-3', 'METER-003');

      SyncStatusService.updateQueueItemStatus(item1.id, 'syncing');

      const active = SyncStatusService.getActiveItems();
      expect(active).toHaveLength(2);
    });
  });

  describe('setNextSyncAt', () => {
    it('should set next sync time', () => {
      const nextTime = Date.now() + 10000;
      SyncStatusService.setNextSyncAt(nextTime);

      const stats = SyncStatusService.getStats();
      expect(stats.nextSyncAt).toBe(nextTime);
    });
  });
});
