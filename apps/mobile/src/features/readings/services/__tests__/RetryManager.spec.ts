import { RetryManager, RetryableTask } from './RetryManager';

describe('RetryManager', () => {
  beforeEach(() => {
    RetryManager.clear();
  });

  describe('addTask', () => {
    it('should add a new task with pending status', () => {
      const taskId = 'test-task-1';
      const data = { readingId: '123' };

      const task = RetryManager.addTask(taskId, data);

      expect(task.id).toBe(taskId);
      expect(task.status).toBe('pending');
      expect(task.attemptCount).toBe(0);
      expect(task.data).toEqual(data);
    });

    it('should calculate initial nextRetryAt', () => {
      const taskId = 'test-task-2';
      const before = Date.now();
      const task = RetryManager.addTask(taskId, {});
      const after = Date.now();

      expect(task.nextRetryAt).toBeGreaterThanOrEqual(before + 1000);
      expect(task.nextRetryAt).toBeLessThanOrEqual(after + 2000);
    });

    it('should override default config', () => {
      const taskId = 'test-task-3';
      const task = RetryManager.addTask(taskId, {}, {
        initialDelayMs: 5000,
        maxRetries: 3,
      });

      const before = Date.now();
      expect(task.nextRetryAt).toBeGreaterThanOrEqual(before + 5000);
    });
  });

  describe('markSuccess', () => {
    it('should mark task as success', () => {
      const taskId = 'test-task-4';
      RetryManager.addTask(taskId, {});

      RetryManager.markSuccess(taskId);

      const task = RetryManager.getTask(taskId);
      expect(task?.status).toBe('success');
    });

    it('should not affect non-existent task', () => {
      // Should not throw
      RetryManager.markSuccess('non-existent');
    });
  });

  describe('markFailed', () => {
    it('should increment attempt count and set retrying status', () => {
      const taskId = 'test-task-5';
      RetryManager.addTask(taskId, {});

      RetryManager.markFailed(taskId, 'Network error');

      const task = RetryManager.getTask(taskId);
      expect(task?.status).toBe('retrying');
      expect(task?.attemptCount).toBe(1);
      expect(task?.error).toBe('Network error');
    });

    it('should apply exponential backoff', () => {
      const taskId = 'test-task-6';
      RetryManager.addTask(taskId, {}, {
        initialDelayMs: 1000,
        backoffMultiplier: 2,
        maxRetries: 10,
      });

      const before1 = Date.now();
      RetryManager.markFailed(taskId, 'Error 1');
      const task1 = RetryManager.getTask(taskId);
      const delay1 = task1!.nextRetryAt - before1;

      RetryManager.markFailed(taskId, 'Error 2');
      const before2 = Date.now();
      const task2 = RetryManager.getTask(taskId);
      const delay2 = task2!.nextRetryAt - before2;

      // Second delay should be approximately double the first
      expect(delay2).toBeGreaterThan(delay1);
    });

    it('should set status to failed when max retries exceeded', () => {
      const taskId = 'test-task-7';
      RetryManager.addTask(taskId, {}, { maxRetries: 2 });

      RetryManager.markFailed(taskId, 'Error 1');
      expect(RetryManager.getTask(taskId)?.status).toBe('retrying');

      RetryManager.markFailed(taskId, 'Error 2');
      expect(RetryManager.getTask(taskId)?.status).toBe('failed');
    });

    it('should not add retry beyond max retries', () => {
      const taskId = 'test-task-8';
      RetryManager.addTask(taskId, {}, { maxRetries: 1 });

      RetryManager.markFailed(taskId, 'Error 1');
      const task = RetryManager.getTask(taskId);
      expect(task?.status).toBe('failed');
      expect(task?.attemptCount).toBe(1);
    });
  });

  describe('getTask', () => {
    it('should return task if exists', () => {
      const taskId = 'test-task-9';
      const data = { value: 100 };
      RetryManager.addTask(taskId, data);

      const task = RetryManager.getTask(taskId);
      expect(task).toBeDefined();
      expect(task?.data).toEqual(data);
    });

    it('should return undefined if task does not exist', () => {
      const task = RetryManager.getTask('non-existent');
      expect(task).toBeUndefined();
    });
  });

  describe('getTasksByStatus', () => {
    it('should return all tasks with specific status', () => {
      RetryManager.addTask('task-1', {});
      RetryManager.addTask('task-2', {});
      RetryManager.addTask('task-3', {});

      RetryManager.markSuccess('task-1');
      RetryManager.markFailed('task-2', 'Error');

      const retryingTasks = RetryManager.getTasksByStatus('retrying');
      const successTasks = RetryManager.getTasksByStatus('success');
      const failedTasks = RetryManager.getTasksByStatus('failed');

      expect(retryingTasks).toHaveLength(1);
      expect(successTasks).toHaveLength(1);
      expect(failedTasks).toHaveLength(1);
    });
  });

  describe('getTasksPendingRetry', () => {
    it('should return tasks ready for retry', async () => {
      const taskId = 'test-task-10';
      RetryManager.addTask(taskId, {}, {
        initialDelayMs: 100,
        maxRetries: 5,
      });

      RetryManager.markFailed(taskId, 'Error');

      // Task should not be ready yet
      let pendingTasks = RetryManager.getTasksPendingRetry();
      expect(pendingTasks).toHaveLength(0);

      // Wait for retry to be due
      await new Promise((resolve) => setTimeout(resolve, 150));

      pendingTasks = RetryManager.getTasksPendingRetry();
      expect(pendingTasks).toHaveLength(1);
      expect(pendingTasks[0].id).toBe(taskId);
    });
  });

  describe('removeTask', () => {
    it('should remove task from manager', () => {
      const taskId = 'test-task-11';
      RetryManager.addTask(taskId, {});

      RetryManager.removeTask(taskId);

      expect(RetryManager.getTask(taskId)).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should return statistics', () => {
      RetryManager.addTask('task-1', {});
      RetryManager.addTask('task-2', {});
      RetryManager.addTask('task-3', {});

      RetryManager.markSuccess('task-1');
      RetryManager.markFailed('task-2', 'Error');

      const stats = RetryManager.getStats();
      expect(stats.totalTasks).toBe(3);
      expect(stats.success).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.pending).toBe(1);
    });
  });

  describe('setRetryHandler', () => {
    it('should call handler on retry attempt', async () => {
      const handler = jest.fn().mockResolvedValue(true);
      RetryManager.setRetryHandler(handler);

      const taskId = 'test-task-12';
      const data = { value: 42 };
      RetryManager.addTask(taskId, data, {
        initialDelayMs: 50,
        maxRetries: 3,
      });

      RetryManager.markFailed(taskId, 'Error');

      // Wait for retry execution
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(handler).toHaveBeenCalled();
    });
  });
});
