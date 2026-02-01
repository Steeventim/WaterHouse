/**
 * ReadingSyncAPI - API client for syncing readings to backend
 * Story 4.1: Synchronisation automatique en ligne
 * Handles HTTP communication with backend for reading uploads
 */

import { OfflineReading } from './OfflineReadingStorage';

export interface SyncResponse {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors?: Array<{ readingId: string; error: string }>;
}

export interface SyncProgress {
  total: number;
  synced: number;
  failed: number;
  current?: string;
}

export class ReadingSyncAPI {
  private static readonly BASE_URL = process.env.API_URL || 'http://localhost:3000';
  private static readonly SYNC_ENDPOINT = '/api/readings/sync';
  private static readonly TIMEOUT_MS = 30000; // 30 seconds

  /**
   * Sync readings to backend
   */
  static async syncReadings(
    readings: OfflineReading[],
    onProgress?: (progress: SyncProgress) => void
  ): Promise<SyncResponse> {
    if (readings.length === 0) {
      return { success: true, syncedCount: 0, failedCount: 0 };
    }

    const progress: SyncProgress = {
      total: readings.length,
      synced: 0,
      failed: 0,
    };

    const errors: Array<{ readingId: string; error: string }> = [];

    // Sync readings in batches
    const batchSize = 10;
    for (let i = 0; i < readings.length; i += batchSize) {
      const batch = readings.slice(i, i + batchSize);

      try {
        const result = await this.syncBatch(batch);
        progress.synced += result.syncedCount;
        progress.failed += result.failedCount;

        if (result.errors) {
          errors.push(...result.errors);
        }

        if (onProgress) {
          onProgress({ ...progress });
        }
      } catch (error) {
        console.error('Batch sync failed:', error);
        batch.forEach((reading) => {
          errors.push({
            readingId: reading.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        });
        progress.failed += batch.length;

        if (onProgress) {
          onProgress({ ...progress });
        }
      }
    }

    return {
      success: progress.failed === 0,
      syncedCount: progress.synced,
      failedCount: progress.failed,
      errors: errors.length > 0 ? errors : undefined,
    };
  }

  /**
   * Sync a batch of readings
   */
  private static async syncBatch(readings: OfflineReading[]): Promise<SyncResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

      const response = await fetch(`${this.BASE_URL}${this.SYNC_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add auth token
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ readings }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        syncedCount: data.syncedCount || readings.length,
        failedCount: data.failedCount || 0,
        errors: data.errors,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Sync timeout - please check your connection');
      }
      throw error;
    }
  }

  /**
   * Upload photo to backend
   */
  static async uploadPhoto(photoPath: string, readingId: string): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: photoPath,
        type: 'image/jpeg',
        name: `reading_${readingId}.jpg`,
      } as unknown as Blob);
      formData.append('readingId', readingId);

      const response = await fetch(`${this.BASE_URL}/api/readings/photos`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          // TODO: Add auth token
        },
      });

      if (!response.ok) {
        throw new Error(`Photo upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.photoUrl;
    } catch (error) {
      console.error('Photo upload failed:', error);
      throw error;
    }
  }

  /**
   * Check backend health
   */
  static async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.BASE_URL}/health`, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}
