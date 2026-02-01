/**
 * Hook for managing sync in React components
 */

import { useEffect, useState, useCallback } from 'react';
import { SyncManager } from '../services/SyncManager';
import { SyncProgress, SyncResult } from '../../../common/types/sync.types';

export const useSync = (syncManager: SyncManager | null) => {
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!syncManager) return;

    const handleSyncProgress = (progress: SyncProgress) => {
      setSyncProgress(progress);
    };

    syncManager.onSyncProgress(handleSyncProgress);

    // Get initial progress
    syncManager.getSyncProgress().then(progress => {
      setSyncProgress(progress);
      setIsInitialized(true);
    });

    return () => {
      syncManager.offSyncProgress(handleSyncProgress);
    };
  }, [syncManager]);

  const performSync = useCallback(async (): Promise<SyncResult> => {
    if (!syncManager) {
      return {
        success: false,
        error: 'SyncManager not initialized',
      };
    }
    return syncManager.performFullSync();
  }, [syncManager]);

  return {
    syncProgress,
    isInitialized,
    performSync,
  };
};
