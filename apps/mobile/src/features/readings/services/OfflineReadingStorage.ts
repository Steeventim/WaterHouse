/**
 * ReadingStorage - Offline reading storage with sync queue
 * Story 3.4: Stockage local hors-ligne
 */

export interface OfflineReading {
  id: string;
  meterId: string;
  reading: number;
  photoPath?: string;
  timestamp: number;
  synced: boolean;
  syncedAt?: number;
  overrideComment?: string;
}

export interface SyncQueueItem {
  readingId: string;
  reading: OfflineReading;
  retries: number;
  error?: string;
}

// Simulated offline storage - in production, use SQLite via LocalStorage
export class ReadingStorage {
  private static queue: Map<string, OfflineReading> = new Map();
  private static syncQueue: SyncQueueItem[] = [];

  /**
   * Save reading offline
   */
  static saveOfflineReading(reading: Omit<OfflineReading, 'id'>): OfflineReading {
    const id = `reading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineReading: OfflineReading = { ...reading, id };
    this.queue.set(id, offlineReading);
    
    // Add to sync queue
    this.syncQueue.push({
      readingId: id,
      reading: offlineReading,
      retries: 0,
    });

    console.log(`[ReadingStorage] Saved offline reading ${id}`);
    return offlineReading;
  }

  /**
   * Get unsynced readings
   */
  static getUnsyncedReadings(): OfflineReading[] {
    return Array.from(this.queue.values()).filter(r => !r.synced);
  }

  /**
   * Mark reading as synced
   */
  static markAsSynced(readingId: string): void {
    const reading = this.queue.get(readingId);
    if (reading) {
      reading.synced = true;
      reading.syncedAt = Date.now();
    }
  }

  /**
   * Get sync queue
   */
  static getSyncQueue(): SyncQueueItem[] {
    return this.syncQueue;
  }

  /**
   * Clear sync queue
   */
  static clearSyncQueue(): void {
    this.syncQueue = [];
  }
}
