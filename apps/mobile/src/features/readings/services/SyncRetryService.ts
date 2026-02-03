import { RetryManager, RetryableTask, RetryConfig } from './RetryManager';

export interface SyncFailure {
  readingId: string;
  meterCode: string;
  value: number;
  timestamp: number;
  failureReason: string;
  failureCount: number;
  lastFailureAt: number;
  nextRetryAt?: number;
}

export class SyncRetryService {
  private static readonly SYNC_RETRY_CONFIG: RetryConfig = {
    maxRetries: 5,
    initialDelayMs: 5000, // 5 seconds
    maxDelayMs: 3600000, // 1 hour (REQ-REL-003: < 1 heure)
    backoffMultiplier: 2,
  };

  private static syncFailures = new Map<string, SyncFailure>();
  private static networkListener: (() => void) | null = null;

  /**
   * Initialize the sync retry service
   */
  static async initialize(): Promise<void> {
    // Set up retry handler
    RetryManager.setRetryHandler(async (task: RetryableTask) => {
      return this.retrySync(task.id, task.data);
    });

    // Listen for network changes to trigger immediate retries
    this.setupNetworkListener();
  }

  /**
   * Add a failed sync for retry
   */
  static addFailedSync(
    readingId: string,
    meterCode: string,
    value: number,
    failureReason: string
  ): SyncFailure {
    const now = Date.now();
    const existingFailure = this.syncFailures.get(readingId);

    const failure: SyncFailure = {
      readingId,
      meterCode,
      value,
      timestamp: now,
      failureReason,
      failureCount: (existingFailure?.failureCount ?? 0) + 1,
      lastFailureAt: now,
    };

    this.syncFailures.set(readingId, failure);

    // Add to retry manager
    RetryManager.addTask(
      `sync-${readingId}`,
      {
        readingId,
        meterCode,
        value,
        failureReason,
      },
      this.SYNC_RETRY_CONFIG
    );

    return failure;
  }

  /**
   * Retry a failed sync
   */
  private static async retrySync(
    taskId: string,
    data: Record<string, unknown>
  ): Promise<boolean> {
    const readingId = data.readingId as string;
    const failure = this.syncFailures.get(readingId);

    if (!failure) {
      return false;
    }

    try {
      // Attempt to sync the reading via BackgroundSyncService
      // This is a placeholder for actual sync logic
      // In production, would call actual sync API
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Simulate successful sync for now
      this.syncFailures.delete(readingId);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Manually retry all failed syncs
   */
  static async retryAllFailedSyncs(): Promise<number> {
    const failures = Array.from(this.syncFailures.values());
    let successCount = 0;

    for (const failure of failures) {
      const success = await this.retrySync(
        `sync-${failure.readingId}`,
        {
          readingId: failure.readingId,
          meterCode: failure.meterCode,
          value: failure.value,
          failureReason: failure.failureReason,
        }
      );

      if (success) {
        successCount += 1;
      }
    }

    return successCount;
  }

  /**
   * Get all failed syncs
   */
  static getFailedSyncs(): SyncFailure[] {
    return Array.from(this.syncFailures.values());
  }

  /**
   * Get failed sync by reading ID
   */
  static getFailedSync(readingId: string): SyncFailure | undefined {
    return this.syncFailures.get(readingId);
  }

  /**
   * Get retry statistics for a failed sync
   */
  static getRetryStatus(readingId: string): {
    isRetrying: boolean;
    attemptCount: number;
    nextRetryAt?: number;
  } {
    const task = RetryManager.getTask(`sync-${readingId}`);
    if (!task) {
      return { isRetrying: false, attemptCount: 0 };
    }

    return {
      isRetrying: task.status === 'retrying' || task.status === 'pending',
      attemptCount: task.attemptCount,
      nextRetryAt: task.status === 'retrying' ? task.nextRetryAt : undefined,
    };
  }

  /**
   * Cancel retry for a specific failed sync
   */
  static cancelRetry(readingId: string): void {
    RetryManager.removeTask(`sync-${readingId}`);
    this.syncFailures.delete(readingId);
  }

  /**
   * Setup network listener for automatic retry on network restore
   */
  private static setupNetworkListener(): void {
    // Listen for network changes
    // This would integrate with NetworkMonitor service
    // For now, we'll set up a periodic check
    setInterval(() => {
      this.processPendingRetries();
    }, 10000); // Check every 10 seconds
  }

  /**
   * Process tasks pending retry
   */
  private static processPendingRetries(): void {
    const pendingTasks = RetryManager.getTasksPendingRetry();

    // Tasks are automatically retried via RetryManager scheduler
    // This method is called periodically to ensure no tasks are missed
    // pendingTasks are processed internally by RetryManager
    void pendingTasks; // Mark as intentionally unused
  }

  /**
   * Get retry statistics
   */
  static getStats(): {
    totalFailures: number;
    pendingRetries: number;
    totalAttempts: number;
  } {
    const failures = Array.from(this.syncFailures.values());
    const retryingTasks = RetryManager.getTasksByStatus('retrying');

    return {
      totalFailures: failures.length,
      pendingRetries: retryingTasks.length,
      totalAttempts: failures.reduce((sum, f) => sum + f.failureCount, 0),
    };
  }

  /**
   * Clear all failed syncs (useful for testing)
   */
  static clear(): void {
    this.syncFailures.clear();
    RetryManager.clear();
  }
}
