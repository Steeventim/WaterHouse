import { useState, useEffect } from 'react';

/**
 * NetworkMonitor - Monitors network connectivity state
 * 
 * Provides callbacks for network availability/loss events
 * Supports subscribing to network state changes
 */
export class NetworkMonitor {
  private isOnline = false;
  private networkAvailableCallbacks: (() => void)[] = [];
  private networkLostCallbacks: (() => void)[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize with online status (assume online on start)
    this.isOnline = true;
    this.initializeNetworkListener();
  }

  /**
   * Initialize network listener based on platform
   * React Native uses NetInfo, Web uses navigator.onLine
   */
  private initializeNetworkListener(): void {
    if (typeof window !== 'undefined' && navigator.onLine !== undefined) {
      // Web environment
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      this.isOnline = navigator.onLine;
    } else {
      // React Native or other environment
      // For React Native, NetInfo would be used
      // This is a fallback implementation
      this.startNetworkCheck();
    }
  }

  /**
   * Handle online event
   */
  private handleOnline = (): void => {
    if (!this.isOnline) {
      this.isOnline = true;
      this.notifyNetworkAvailable();
    }
  };

  /**
   * Handle offline event
   */
  private handleOffline = (): void => {
    if (this.isOnline) {
      this.isOnline = false;
      this.notifyNetworkLost();
    }
  };

  /**
   * Start periodic network check (fallback for non-web environments)
   */
  private startNetworkCheck(): void {
    this.checkInterval = setInterval(() => {
      this.checkNetworkStatus();
    }, 5000); // Check every 5 seconds
  }

  /**
   * Check network status by attempting a lightweight request
   */
  private async checkNetworkStatus(): Promise<void> {
    try {
      // Attempt a lightweight request
      const response = await fetch('/health', { method: 'HEAD', cache: 'no-cache' });
      if (response.ok && !this.isOnline) {
        this.isOnline = true;
        this.notifyNetworkAvailable();
      }
    } catch {
      if (this.isOnline) {
        this.isOnline = false;
        this.notifyNetworkLost();
      }
    }
  }

  /**
   * Notify all network available callbacks
   */
  private notifyNetworkAvailable(): void {
    this.networkAvailableCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Error in network available callback:', error);
      }
    });
  }

  /**
   * Notify all network lost callbacks
   */
  private notifyNetworkLost(): void {
    this.networkLostCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Error in network lost callback:', error);
      }
    });
  }

  /**
   * Check current online status
   */
  async checkIsOnline(): Promise<boolean> {
    try {
      const response = await fetch('/health', { method: 'HEAD', cache: 'no-cache' });
      this.isOnline = response.ok;
      return this.isOnline;
    } catch {
      this.isOnline = false;
      return false;
    }
  }

  /**
   * Get current online status
   */
  getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Register callback for when network becomes available
   */
  onNetworkAvailable(callback: () => void): void {
    this.networkAvailableCallbacks.push(callback);
  }

  /**
   * Register callback for when network is lost
   */
  onNetworkLost(callback: () => void): void {
    this.networkLostCallbacks.push(callback);
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
   * Clean up resources
   */
  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.networkAvailableCallbacks = [];
    this.networkLostCallbacks = [];
  }
}

// Create singleton instance
let networkMonitor: NetworkMonitor | null = null;

/**
 * Get or create NetworkMonitor singleton
 */
export function getNetworkMonitor(): NetworkMonitor {
  if (!networkMonitor) {
    networkMonitor = new NetworkMonitor();
  }
  return networkMonitor;
}

/**
 * React hook for network monitoring
 */
export function useNetworkMonitor(): { isOnline: boolean } {
  const [isOnline, setIsOnline] = useState(true);
  const monitor = getNetworkMonitor();

  useEffect(() => {
    // Set initial state
    setIsOnline(monitor.getIsOnline());

    // Register callbacks
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    monitor.onNetworkAvailable(handleOnline);
    monitor.onNetworkLost(handleOffline);

    return () => {
      monitor.removeNetworkAvailableCallback(handleOnline);
      monitor.removeNetworkLostCallback(handleOffline);
    };
  }, []);

  return { isOnline };
}
