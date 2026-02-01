/**
 * Network monitoring service for WaterHouse mobile application
 * Tracks network state changes and notifies subscribers
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export class NetworkMonitor {
  private isOnlineValue = false;
  private networkAvailableCallbacks: (() => void)[] = [];
  private networkLostCallbacks: (() => void)[] = [];
  private unsubscribe: (() => void) | null = null;

  /**
   * Initialize network monitoring
   */
  async initialize(): Promise<void> {
    try {
      // Get initial network state
      const state = await NetInfo.fetch();
      this.isOnlineValue = state.isConnected ?? false;

      // Subscribe to network state changes
      this.unsubscribe = NetInfo.addEventListener(this.handleNetworkChange);
    } catch (error) {
      console.error('Failed to initialize NetworkMonitor:', error);
      this.isOnlineValue = false;
    }
  }

  /**
   * Handle network state changes
   */
  private handleNetworkChange = (state: NetInfoState): void => {
    const wasOnline = this.isOnlineValue;
    this.isOnlineValue = state.isConnected ?? false;

    if (!wasOnline && this.isOnlineValue) {
      // Network became available
      this.networkAvailableCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in network available callback:', error);
        }
      });
    } else if (wasOnline && !this.isOnlineValue) {
      // Network was lost
      this.networkLostCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in network lost callback:', error);
        }
      });
    }
  };

  /**
   * Check current online status
   */
  async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Failed to check network status:', error);
      return false;
    }
  }

  /**
   * Get current cached online status
   */
  isOnlineSync(): boolean {
    return this.isOnlineValue;
  }

  /**
   * Register callback for when network becomes available
   */
  onNetworkAvailable(callback: () => void): void {
    if (callback) {
      this.networkAvailableCallbacks.push(callback);
    }
  }

  /**
   * Register callback for when network is lost
   */
  onNetworkLost(callback: () => void): void {
    if (callback) {
      this.networkLostCallbacks.push(callback);
    }
  }

  /**
   * Remove network available callback
   */
  removeNetworkAvailableCallback(callback: () => void): void {
    const index = this.networkAvailableCallbacks.indexOf(callback);
    if (index > -1) {
      this.networkAvailableCallbacks.splice(index, 1);
    }
  }

  /**
   * Remove network lost callback
   */
  removeNetworkLostCallback(callback: () => void): void {
    const index = this.networkLostCallbacks.indexOf(callback);
    if (index > -1) {
      this.networkLostCallbacks.splice(index, 1);
    }
  }

  /**
   * Clean up and unsubscribe from network changes
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.networkAvailableCallbacks = [];
    this.networkLostCallbacks = [];
  }
}
