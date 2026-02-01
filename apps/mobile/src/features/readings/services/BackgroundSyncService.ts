/**
 * BackgroundSyncService - Manages automatic background synchronization
 * Story 4.1: Synchronisation automatique en ligne
 * Handles auto-sync on connectivity restore, battery-aware scheduling
 */

import { ReadingStorage } from './OfflineReadingStorage';
import { OfflineQueue } from './OfflineQueue';
import { ReadingSyncAPI, SyncProgress } from './ReadingSyncAPI';
import { NetworkMonitor } from '../../catalog/services/NetworkMonitor';

export interface BackgroundSyncConfig {
  autoSyncOnConnect: boolean;
  batteryThreshold: number; // Percentage (0-100)
  maxRetries: number;
  retryDelayMs: number;
}

export interface SyncNotification {
  type: 'progress' | 'success' | 'error';
  message: string;
  progress?: SyncProgress;
}

export class BackgroundSyncService {
  private static isInitialized = false;
  private static isSyncing = false;
  private static syncListeners: ((notification: SyncNotification) => void)[] = [];
  private static networkMonitor: NetworkMonitor | null = null;
  private static config: BackgroundSyncConfig = {
    autoSyncOnConnect: true,
    batteryThreshold: 15, // Don't sync below 15% battery
    maxRetries: 3,
    retryDelayMs: 5000,
  };

  /**
   * Initialize background sync service
   */
  static init(config?: Partial<BackgroundSyncConfig>): void {
    if (this.isInitialized) {
      console.log('[BackgroundSync] Already initialized');
      return;
    }

    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Initialize network monitor
    this.networkMonitor = new NetworkMonitor();
    this.networkMonitor.onNetworkAvailable(() => {
      if (this.config.autoSyncOnConnect) {
        this.triggerAutoSync();
      }
    });

    // Initialize offline queue
    OfflineQueue.init();

    this.isInitialized = true;
    console.log('[BackgroundSync] Initialized with config:', this.config);
  }

  /**
   * Trigger automatic sync
   */
  private static async triggerAutoSync(): Promise<void> {
    if (this.isSyncing) {
      console.log('[BackgroundSync] Sync already in progress, skipping');
      return;
    }

    const pendingCount = ReadingStorage.getUnsyncedReadings().length;
    if (pendingCount === 0) {
      console.log('[BackgroundSync] No readings to sync');
      return;
    }

    // Check battery level
    const batteryOk = await this.checkBatteryLevel();
    if (!batteryOk) {
      this.notifyListeners({
        type: 'error',
        message: 'Sync skipped: battery level too low',
      });
      return;
    }

    // Wait for network to stabilize
    await this.delay(2000);

    // Start sync
    await this.syncAll();
  }

  /**
   * Manually trigger sync
   */
  static async syncNow(): Promise<void> {
    if (this.isSyncing) {
      throw new Error('Sync already in progress');
    }

    // Check network
    const isOnline = this.networkMonitor?.getIsOnline() ?? false;
    if (!isOnline) {
      throw new Error('No network connection available');
    }

    await this.syncAll();
  }

  /**
   * Sync all unsynced readings
   */
  private static async syncAll(): Promise<void> {
    this.isSyncing = true;

    try {
      const unsyncedReadings = ReadingStorage.getUnsyncedReadings();

      this.notifyListeners({
        type: 'progress',
        message: `Starting sync of ${unsyncedReadings.length} readings...`,
        progress: {
          total: unsyncedReadings.length,
          synced: 0,
          failed: 0,
        },
      });

      // Sync readings to backend
      const result = await ReadingSyncAPI.syncReadings(
        unsyncedReadings,
        (progress) => {
          this.notifyListeners({
            type: 'progress',
            message: `Syncing: ${progress.synced}/${progress.total}`,
            progress,
          });
        }
      );

      // Mark synced readings
      unsyncedReadings.forEach((reading) => {
        if (!result.errors?.find((e) => e.readingId === reading.id)) {
          ReadingStorage.markAsSynced(reading.id);
        }
      });

      // Clear sync queue for successful items
      ReadingStorage.clearSyncQueue();

      if (result.success) {
        this.notifyListeners({
          type: 'success',
          message: `Successfully synced ${result.syncedCount} readings`,
        });
      } else {
        this.notifyListeners({
          type: 'error',
          message: `Sync completed with ${result.failedCount} failures`,
        });
      }

      console.log('[BackgroundSync] Sync completed:', result);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.notifyListeners({
        type: 'error',
        message: `Sync failed: ${message}`,
      });
      console.error('[BackgroundSync] Sync error:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Check if battery level is sufficient for sync
   */
  private static async checkBatteryLevel(): Promise<boolean> {
    try {
      // In a real app, use react-native-device-info or similar
      // For now, assume battery is OK
      return true;

      // Example implementation:
      // const batteryLevel = await DeviceInfo.getBatteryLevel();
      // return batteryLevel * 100 >= this.config.batteryThreshold;
    } catch {
      return true; // Default to allowing sync if battery check fails
    }
  }

  /**
   * Subscribe to sync notifications
   */
  static onSyncNotification(
    callback: (notification: SyncNotification) => void
  ): () => void {
    this.syncListeners.push(callback);
    return () => {
      const index = this.syncListeners.indexOf(callback);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners
   */
  private static notifyListeners(notification: SyncNotification): void {
    this.syncListeners.forEach((listener) => {
      try {
        listener(notification);
      } catch (error) {
        console.error('[BackgroundSync] Listener error:', error);
      }
    });
  }

  /**
   * Get sync status
   */
  static isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  /**
   * Update configuration
   */
  static updateConfig(config: Partial<BackgroundSyncConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[BackgroundSync] Config updated:', this.config);
  }

  /**
   * Utility: delay execution
   */
  private static delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
