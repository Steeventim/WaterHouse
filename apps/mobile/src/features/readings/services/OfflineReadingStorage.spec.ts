/**
 * Tests for offline reading storage and sync queue
 * Story 3.4: Stockage local hors-ligne
 */

import { ReadingStorage } from './OfflineReadingStorage';
import { OfflineQueue, SyncStatus } from './OfflineQueue';

describe('OfflineReadingStorage', () => {
  beforeEach(() => {
    ReadingStorage.clearSyncQueue();
  });

  it('should save offline reading', () => {
    const reading = ReadingStorage.saveOfflineReading({
      meterId: 'meter_001',
      reading: 250,
      timestamp: Date.now(),
      synced: false,
    });

    expect(reading.id).toBeDefined();
    expect(reading.meterId).toBe('meter_001');
    expect(reading.reading).toBe(250);
    expect(reading.synced).toBe(false);
  });

  it('should track unsynced readings', () => {
    ReadingStorage.saveOfflineReading({
      meterId: 'meter_001',
      reading: 250,
      timestamp: Date.now(),
      synced: false,
    });

    const unsynced = ReadingStorage.getUnsyncedReadings();
    expect(unsynced).toHaveLength(1);
  });

  it('should mark as synced', () => {
    const reading = ReadingStorage.saveOfflineReading({
      meterId: 'meter_001',
      reading: 250,
      timestamp: Date.now(),
      synced: false,
    });

    ReadingStorage.markAsSynced(reading.id);

    const unsynced = ReadingStorage.getUnsyncedReadings();
    expect(unsynced).toHaveLength(0);
  });
});

describe('OfflineQueue', () => {
  beforeEach(() => {
    ReadingStorage.clearSyncQueue();
  });

  it('should add reading to queue', () => {
    const reading = ReadingStorage.saveOfflineReading({
      meterId: 'meter_001',
      reading: 250,
      timestamp: Date.now(),
      synced: false,
    });

    OfflineQueue.addToQueue(reading);

    expect(OfflineQueue.getPendingCount()).toBeGreaterThan(0);
  });

  it('should track sync status', () => {
    const reading = ReadingStorage.saveOfflineReading({
      meterId: 'meter_001',
      reading: 250,
      timestamp: Date.now(),
      synced: false,
    });

    OfflineQueue.addToQueue(reading);

    expect(OfflineQueue.getStatus()).toBe(SyncStatus.PENDING);
  });

  it('should notify status changes', (done) => {
    const reading = ReadingStorage.saveOfflineReading({
      meterId: 'meter_001',
      reading: 250,
      timestamp: Date.now(),
      synced: false,
    });

    OfflineQueue.onStatusChange((status) => {
      if (status === SyncStatus.PENDING) {
        expect(status).toBe(SyncStatus.PENDING);
        done();
      }
    });

    OfflineQueue.addToQueue(reading);
  });
});
