/**
 * useOfflineReading - Hook for offline reading submission
 * Story 3.4: Stockage local hors-ligne
 */

import { useState, useCallback } from 'react';
import { ReadingStorage } from '../services/OfflineReadingStorage';
import { OfflineQueue } from '../services/OfflineQueue';

export const useOfflineReading = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const submitOfflineReading = useCallback(
    async (
      meterId: string,
      reading: number,
      photoPath?: string,
      overrideComment?: string
    ) => {
      setIsSubmitting(true);
      setError(undefined);

      try {
        // Store offline reading
        const offlineReading = ReadingStorage.saveOfflineReading({
          meterId,
          reading,
          photoPath,
          timestamp: Date.now(),
          synced: false,
          overrideComment,
        });

        // Add to sync queue
        OfflineQueue.addToQueue(offlineReading);

        // Try to sync
        await OfflineQueue.sync();

        return offlineReading;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Offline submission failed';
        setError(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    []
  );

  const retrySync = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await OfflineQueue.sync();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sync failed';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return {
    submitOfflineReading,
    retrySync,
    isSubmitting,
    error,
    pendingCount: ReadingStorage.getUnsyncedReadings().length,
    syncStatus: OfflineQueue.getStatus(),
  };
};
