export interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export interface RetryableTask {
  id: string;
  attemptCount: number;
  lastAttemptAt: number;
  nextRetryAt: number;
  status: 'pending' | 'retrying' | 'failed' | 'success';
  error?: string;
  data: Record<string, unknown>;
}

export class RetryManager {
  private static readonly DEFAULT_CONFIG: RetryConfig = {
    maxRetries: 5,
    initialDelayMs: 1000,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
  };

  private static tasks = new Map<string, RetryableTask>();
  private static retryTimers = new Map<string, NodeJS.Timeout>();
  private static onRetry: ((task: RetryableTask) => Promise<boolean>) | null = null;

  /**
   * Register a callback function to handle retry attempts
   */
  static setRetryHandler(
    handler: (task: RetryableTask) => Promise<boolean>
  ): void {
    this.onRetry = handler;
  }

  /**
   * Add a task for retry management
   */
  static addTask(
    taskId: string,
    data: Record<string, unknown>,
    config: Partial<RetryConfig> = {}
  ): RetryableTask {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    const task: RetryableTask = {
      id: taskId,
      attemptCount: 0,
      lastAttemptAt: Date.now(),
      nextRetryAt: Date.now() + finalConfig.initialDelayMs,
      status: 'pending',
      data,
    };

    this.tasks.set(taskId, task);
    this.scheduleRetry(taskId, finalConfig);

    return task;
  }

  /**
   * Mark a task as successfully synced
   */
  static markSuccess(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) {
      task.status = 'success';
      this.clearRetryTimer(taskId);
    }
  }

  /**
   * Mark a task as failed and schedule retry
   */
  static markFailed(
    taskId: string,
    error: string,
    config: Partial<RetryConfig> = {}
  ): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    if (task.attemptCount >= finalConfig.maxRetries) {
      task.status = 'failed';
      task.error = error;
      this.clearRetryTimer(taskId);
      return;
    }

    task.attemptCount += 1;
    task.status = 'retrying';
    task.error = error;
    task.lastAttemptAt = Date.now();

    // Calculate exponential backoff with jitter
    const baseDelay = Math.min(
      finalConfig.initialDelayMs *
        Math.pow(finalConfig.backoffMultiplier, task.attemptCount - 1),
      finalConfig.maxDelayMs
    );
    const jitter = Math.random() * 0.1 * baseDelay;
    const delay = Math.floor(baseDelay + jitter);

    task.nextRetryAt = Date.now() + delay;
    this.scheduleRetry(taskId, finalConfig);
  }

  /**
   * Get a task by ID
   */
  static getTask(taskId: string): RetryableTask | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * Get all tasks with a specific status
   */
  static getTasksByStatus(status: RetryableTask['status']): RetryableTask[] {
    return Array.from(this.tasks.values()).filter((task) => task.status === status);
  }

  /**
   * Get all tasks pending retry (check based on nextRetryAt)
   */
  static getTasksPendingRetry(): RetryableTask[] {
    const now = Date.now();
    return Array.from(this.tasks.values()).filter(
      (task) => task.status === 'retrying' && task.nextRetryAt <= now
    );
  }

  /**
   * Remove a task from retry management
   */
  static removeTask(taskId: string): void {
    this.clearRetryTimer(taskId);
    this.tasks.delete(taskId);
  }

  /**
   * Get retry statistics
   */
  static getStats(): {
    totalTasks: number;
    pending: number;
    retrying: number;
    failed: number;
    success: number;
  } {
    const tasks = Array.from(this.tasks.values());
    return {
      totalTasks: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      retrying: tasks.filter((t) => t.status === 'retrying').length,
      failed: tasks.filter((t) => t.status === 'failed').length,
      success: tasks.filter((t) => t.status === 'success').length,
    };
  }

  /**
   * Clear all tasks (useful for testing)
   */
  static clear(): void {
    this.retryTimers.forEach((timer) => clearTimeout(timer));
    this.retryTimers.clear();
    this.tasks.clear();
  }

  /**
   * Schedule a retry for a specific task
   */
  private static scheduleRetry(
    taskId: string,
    config: RetryConfig
  ): void {
    this.clearRetryTimer(taskId);

    const task = this.tasks.get(taskId);
    if (!task || task.status === 'success' || task.status === 'failed') {
      return;
    }

    const delay = Math.max(0, task.nextRetryAt - Date.now());

    const timer = setTimeout(() => {
      this.executeRetry(taskId, config);
    }, delay);

    this.retryTimers.set(taskId, timer);
  }

  /**
   * Execute a retry attempt for a task
   */
  private static async executeRetry(
    taskId: string,
    config: RetryConfig
  ): Promise<void> {
    const task = this.tasks.get(taskId);
    if (!task || !this.onRetry) {
      return;
    }

    try {
      const success = await this.onRetry(task);
      if (success) {
        this.markSuccess(taskId);
      } else {
        this.markFailed(taskId, 'Retry attempt failed', config);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.markFailed(taskId, errorMessage, config);
    }
  }

  /**
   * Clear the retry timer for a task
   */
  private static clearRetryTimer(taskId: string): void {
    const timer = this.retryTimers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.retryTimers.delete(taskId);
    }
  }
}
