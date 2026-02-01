/**
 * Sync manager service for WaterHouse mobile application
 * Orchestrates synchronization of catalog data between API and local storage
 */

import { ApiClient } from './ApiClient';
import { LocalStorage } from './LocalStorage';
import { NetworkMonitor } from '../../../common/services/NetworkMonitor';
import {
  SyncResult,
  SyncProgress,
} from '../../../common/types/sync.types';

export class SyncManager {
  private readonly SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes
  private syncInProgress = false;
  private syncIntervalId: NodeJS.Timeout | null = null;
  private syncProgressCallbacks: ((progress: SyncProgress) => void)[] = [];
  private lastSyncError: string | null = null;

  constructor(
    private apiClient: ApiClient,
    private localStorage: LocalStorage,
    private networkMonitor: NetworkMonitor
  ) {}

  /**
   * Initialize sync manager
   */
  async initialize(): Promise<void> {
    try {
      // Initialize storage
      await this.localStorage.initialize();

      // Initialize network monitor
      await this.networkMonitor.initialize();

      // Set up network state listeners
      this.networkMonitor.onNetworkAvailable(() => {
        console.log('Network became available, starting sync...');
        this.startPeriodicSync();
        this.performFullSync().catch(error => {
          console.error('Initial sync on network available failed:', error);
        });
      });

      this.networkMonitor.onNetworkLost(() => {
        console.log('Network lost, stopping sync...');
        this.stopPeriodicSync();
        this.notifyProgress();
      });

      // Perform initial sync if online
      const isOnline = await this.networkMonitor.isOnline();
      if (isOnline) {
        await this.performFullSync();
        this.startPeriodicSync();
      }

      console.log('SyncManager initialized');
    } catch (error) {
      console.error('Failed to initialize SyncManager:', error);
      throw error;
    }
  }

  /**
   * Perform full synchronization
   */
  async performFullSync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      console.warn('Sync already in progress');
      return {
        success: false,
        error: 'Sync already in progress',
      };
    }

    this.syncInProgress = true;
    this.notifyProgress();

    try {
      // Check network connectivity
      const isOnline = await this.networkMonitor.isOnline();
      if (!isOnline) {
        throw new Error('No network connectivity');
      }

      // Get user ID and last sync timestamp
      const userId = await this.getUserId();
      if (!userId) {
        throw new Error('User ID not available');
      }

      const lastSync = await this.localStorage.getLastSyncTimestamp();

      // Fetch catalog data from API
      console.log(`Syncing catalog data for user ${userId}...`);
      const catalogData = await this.apiClient.getCatalogSync({
        lastSync: lastSync || undefined,
        userId,
      });

      // Store data locally
      await this.localStorage.storeCatalogData(catalogData);

      this.lastSyncError = null;

      const result: SyncResult = {
        success: true,
        recordsSynced: catalogData.totalRecords,
        timestamp: catalogData.syncTimestamp,
      };

      console.log(`Sync completed: ${catalogData.totalRecords} records`);
      this.notifyProgress();

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Sync failed:', errorMessage);
      this.lastSyncError = errorMessage;
      this.notifyProgress();

      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Perform incremental synchronization
   */
  async performIncrementalSync(): Promise<SyncResult> {
    // For now, incremental sync is the same as full sync
    // In the future, this could be optimized for delta updates
    return this.performFullSync();
  }

  /**
   * Start periodic sync when online
   */
  private startPeriodicSync(): void {
    if (this.syncIntervalId) {
      return; // Already running
    }

    console.log(`Starting periodic sync every ${this.SYNC_INTERVAL}ms`);

    this.syncIntervalId = setInterval(() => {
      const isOnlineSync = this.networkMonitor.isOnlineSync();
      if (isOnlineSync && !this.syncInProgress) {
        this.performFullSync().catch(error => {
          console.error('Periodic sync failed:', error);
        });
      }
    }, this.SYNC_INTERVAL);
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(): void {
    if (this.syncIntervalId) {
      console.log('Stopping periodic sync');
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
  }

  /**
   * Get current sync progress
   */
  async getSyncProgress(): Promise<SyncProgress> {
    const isOnline = await this.networkMonitor.isOnline();
    const lastSyncTime = await this.localStorage.getLastSyncTimestamp();

    return {
      isOnline,
      isSyncing: this.syncInProgress,
      lastSyncTime: lastSyncTime ? new Date(lastSyncTime) : undefined,
      syncError: this.lastSyncError || undefined,
    };
  }

  /**
   * Register callback for sync progress updates
   */
  onSyncProgress(callback: (progress: SyncProgress) => void): void {
    if (callback) {
      this.syncProgressCallbacks.push(callback);
    }
  }

  /**
   * Unregister sync progress callback
   */
  offSyncProgress(callback: (progress: SyncProgress) => void): void {
    const index = this.syncProgressCallbacks.indexOf(callback);
    if (index > -1) {
      this.syncProgressCallbacks.splice(index, 1);
    }
  }

  /**
   * Notify all subscribers of sync progress
   */
  private async notifyProgress(): Promise<void> {
    const progress = await this.getSyncProgress();
    this.syncProgressCallbacks.forEach(callback => {
      try {
        callback(progress);
      } catch (error) {
        console.error('Error in sync progress callback:', error);
      }
    });
  }

  /**
   * Set authorization token for API requests
   */
  setAuthToken(token: string): void {
    this.apiClient.setAuthToken(token);
  }

  /**
   * Remove authorization token
   */
  removeAuthToken(): void {
    this.apiClient.removeAuthToken();
  }

  /**
   * Get user ID from local storage (to be implemented with auth service)
   */
  private async getUserId(): Promise<string | null> {
    try {
      const assignments = await this.localStorage.getUserAssignments();
      return assignments?.userId || null;
    } catch (error) {
      console.error('Failed to get user ID:', error);
      return null;
    }
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    this.stopPeriodicSync();
    this.networkMonitor.destroy();
    await this.localStorage.close();
    this.syncProgressCallbacks = [];
  }
}
