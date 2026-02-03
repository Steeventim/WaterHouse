export interface SyncQueueItem {
  id: string;
  readingId: string;
  meterCode: string;
  timestamp: number;
  status: 'pending' | 'syncing' | 'success' | 'failed';
  error?: string;
  retryCount: number;
}

export interface SyncStatistics {
  totalItems: number;
  successfulItems: number;
  failedItems: number;
  pendingItems: number;
  syncingItems: number;
  successRate: number;
  averageSyncTime: number;
  lastSyncAt: number | null;
  nextSyncAt: number | null;
}

export interface SyncHistory {
  id: string;
  readingId: string;
  meterCode: string;
  status: 'success' | 'failed';
  timestamp: number;
  duration: number;
  error?: string;
}

export class SyncStatusService {
  private static queue: Map<string, SyncQueueItem> = new Map();
  private static history: SyncHistory[] = [];
  private static stats: SyncStatistics = {
    totalItems: 0,
    successfulItems: 0,
    failedItems: 0,
    pendingItems: 0,
    syncingItems: 0,
    successRate: 0,
    averageSyncTime: 0,
    lastSyncAt: null,
    nextSyncAt: null,
  };

  /**
   * Initialize sync status tracking
   */
  static initialize(): void {
    this.updateStats();
  }

  /**
   * Add item to sync queue
   */
  static addToQueue(
    readingId: string,
    meterCode: string
  ): SyncQueueItem {
    const item: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      readingId,
      meterCode,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    this.queue.set(item.id, item);
    this.updateStats();

    return item;
  }

  /**
   * Update queue item status
   */
  static updateQueueItemStatus(
    itemId: string,
    status: SyncQueueItem['status'],
    error?: string
  ): SyncQueueItem | undefined {
    const item = this.queue.get(itemId);
    if (!item) return undefined;

    item.status = status;
    if (error) {
      item.error = error;
    }

    if (status === 'success' || status === 'failed') {
      this.addToHistory(item, status, error);
    }

    this.updateStats();
    return item;
  }

  /**
   * Increment retry count for queue item
   */
  static incrementRetryCount(itemId: string): void {
    const item = this.queue.get(itemId);
    if (item) {
      item.retryCount += 1;
      this.updateStats();
    }
  }

  /**
   * Remove item from queue
   */
  static removeFromQueue(itemId: string): void {
    this.queue.delete(itemId);
    this.updateStats();
  }

  /**
   * Clear completed items from queue
   */
  static clearCompletedItems(): void {
    for (const [id, item] of this.queue.entries()) {
      if (item.status === 'success' || item.status === 'failed') {
        this.queue.delete(id);
      }
    }
    this.updateStats();
  }

  /**
   * Get current queue
   */
  static getQueue(): SyncQueueItem[] {
    return Array.from(this.queue.values());
  }

  /**
   * Get queue item by ID
   */
  static getQueueItem(itemId: string): SyncQueueItem | undefined {
    return this.queue.get(itemId);
  }

  /**
   * Add item to sync history
   */
  private static addToHistory(
    item: SyncQueueItem,
    status: 'success' | 'failed',
    error?: string
  ): void {
    const historyItem: SyncHistory = {
      id: item.id,
      readingId: item.readingId,
      meterCode: item.meterCode,
      status,
      timestamp: item.timestamp,
      duration: Date.now() - item.timestamp,
      error,
    };

    this.history.unshift(historyItem);

    // Keep last 100 history items
    if (this.history.length > 100) {
      this.history.pop();
    }
  }

  /**
   * Get sync history
   */
  static getHistory(limit = 50): SyncHistory[] {
    return this.history.slice(0, limit);
  }

  /**
   * Get sync history by reading ID
   */
  static getHistoryByReading(readingId: string, limit = 20): SyncHistory[] {
    return this.history
      .filter((item) => item.readingId === readingId)
      .slice(0, limit);
  }

  /**
   * Get sync statistics
   */
  static getStats(): SyncStatistics {
    return { ...this.stats };
  }

  /**
   * Set next sync time
   */
  static setNextSyncAt(timestamp: number): void {
    this.stats.nextSyncAt = timestamp;
  }

  /**
   * Clear all data (useful for testing)
   */
  static clear(): void {
    this.queue.clear();
    this.history = [];
    this.stats = {
      totalItems: 0,
      successfulItems: 0,
      failedItems: 0,
      pendingItems: 0,
      syncingItems: 0,
      successRate: 0,
      averageSyncTime: 0,
      lastSyncAt: null,
      nextSyncAt: null,
    };
  }

  /**
   * Update statistics
   */
  private static updateStats(): void {
    const items = Array.from(this.queue.values());

    this.stats.totalItems = items.length;
    this.stats.pendingItems = items.filter((i) => i.status === 'pending').length;
    this.stats.syncingItems = items.filter((i) => i.status === 'syncing').length;
    this.stats.successfulItems = items.filter((i) => i.status === 'success').length;
    this.stats.failedItems = items.filter((i) => i.status === 'failed').length;

    // Calculate success rate
    if (this.history.length > 0) {
      const successCount = this.history.filter((h) => h.status === 'success').length;
      this.stats.successRate = (successCount / this.history.length) * 100;
    }

    // Calculate average sync time
    if (this.history.length > 0) {
      const totalTime = this.history.reduce((sum, h) => sum + h.duration, 0);
      this.stats.averageSyncTime = totalTime / this.history.length;
    }

    // Update last sync time
    if (this.history.length > 0) {
      const lastSuccess = this.history.find((h) => h.status === 'success');
      if (lastSuccess) {
        this.stats.lastSyncAt = lastSuccess.timestamp;
      }
    }
  }

  /**
   * Get sync progress percentage
   */
  static getProgress(): number {
    if (this.stats.totalItems === 0) return 100;

    const completed = this.stats.successfulItems + this.stats.failedItems;
    return (completed / this.stats.totalItems) * 100;
  }

  /**
   * Get failed items requiring action
   */
  static getFailedItems(): SyncQueueItem[] {
    return Array.from(this.queue.values()).filter((i) => i.status === 'failed');
  }

  /**
   * Get pending and syncing items
   */
  static getActiveItems(): SyncQueueItem[] {
    return Array.from(this.queue.values()).filter(
      (i) => i.status === 'pending' || i.status === 'syncing'
    );
  }
}
