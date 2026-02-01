/**
 * useBackgroundSync - Hook for managing background sync
 * Story 4.1: Synchronisation automatique en ligne
 */

import { useEffect, useState, useCallback } from 'react';
import { BackgroundSyncService, SyncNotification } from '../services/BackgroundSyncService';

export const useBackgroundSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastNotification, setLastNotification] = useState<SyncNotification | null>(null);

  useEffect(() => {
    // Initialize background sync
    BackgroundSyncService.init({
      autoSyncOnConnect: true,
      batteryThreshold: 15,
      maxRetries: 3,
      retryDelayMs: 5000,
    });

    // Subscribe to sync notifications
    const unsubscribe = BackgroundSyncService.onSyncNotification((notification) => {
      setLastNotification(notification);
      setIsSyncing(BackgroundSyncService.isSyncInProgress());
    });

    return unsubscribe;
  }, []);

  const triggerSync = useCallback(async () => {
    try {
      setIsSyncing(true);
      await BackgroundSyncService.syncNow();
    } catch (error) {
      console.error('Manual sync failed:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return {
    isSyncing,
    lastNotification,
    triggerSync,
  };
};
