/**
 * OfflineQueue - Manages sync queue and automatic sync on network reconnection
 * Story 3.4: Stockage local hors-ligne
 */

import { ReadingStorage, OfflineReading } from './OfflineReadingStorage';
import { NetworkMonitor } from '../../catalog/services/NetworkMonitor';

export enum SyncStatus {
  IDLE = 'idle',
  SYNCING = 'syncing',
  PENDING = 'pending',
  OFFLINE = 'offline',
  ERROR = 'error',
}

export class OfflineQueue {
  private static syncStatus = SyncStatus.IDLE;
  private static statusListeners: ((status: SyncStatus) => void)[] = [];
  private static isSyncing = false;

  /**
   * Initialize offline queue
   */
  static init(): void {
    // Subscribe to network changes
    const networkMonitor = new NetworkMonitor();
    networkMonitor.onNetworkAvailable(() => {
      if (ReadingStorage.getUnsyncedReadings().length > 0) {
        this.syncWhenOnline();
      } else {
        this.updateStatus(SyncStatus.IDLE);
      }
    });

    networkMonitor.onNetworkLost(() => {
      this.updateStatus(SyncStatus.OFFLINE);
    });

    console.log('[OfflineQueue] Initialized');
  }

  /**
   * Add reading to sync queue
   */
  static addToQueue(reading: OfflineReading): void {
    const queue = ReadingStorage.getSyncQueue();
    if (!queue.find(item => item.readingId === reading.id)) {
      queue.push({ readingId: reading.id, reading, retries: 0 });
      this.updateStatus(SyncStatus.PENDING);
    }
  }

  /**
   * Attempt to sync readings
   */
  static async sync(): Promise<void> {
    if (this.isSyncing) return;

    const unsyncedReadings = ReadingStorage.getUnsyncedReadings();
    if (unsyncedReadings.length === 0) {
      this.updateStatus(SyncStatus.IDLE);
      return;
    }

    this.isSyncing = true;
    this.updateStatus(SyncStatus.SYNCING);

    try {
      // TODO: Call backend API to sync readings
      // For now, simulate sync
      for (const reading of unsyncedReadings) {
        ReadingStorage.markAsSynced(reading.id);
      }

      ReadingStorage.clearSyncQueue();
      this.updateStatus(SyncStatus.IDLE);
      console.log(`[OfflineQueue] Synced ${unsyncedReadings.length} readings`);
    } catch (error) {
      console.error('[OfflineQueue] Sync failed:', error);
      this.updateStatus(SyncStatus.ERROR);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get current sync status
   */
  static getStatus(): SyncStatus {
    return this.syncStatus;
  }

  /**
   * Get pending reading count
   */
  static getPendingCount(): number {
    return ReadingStorage.getUnsyncedReadings().length;
  }

  /**
   * Subscribe to status changes
   */
  static onStatusChange(callback: (status: SyncStatus) => void): () => void {
    this.statusListeners.push(callback);
    return () => {
      const index = this.statusListeners.indexOf(callback);
      if (index > -1) this.statusListeners.splice(index, 1);
    };
  }

  /**
   * Update status and notify listeners
   */
  private static updateStatus(status: SyncStatus): void {
    if (this.syncStatus !== status) {
      this.syncStatus = status;
      this.statusListeners.forEach(cb => cb(status));
    }
  }

  /**
   * Sync when network reconnects
   */
  private static async syncWhenOnline(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for network to stabilize
    await this.sync();
  }
}
