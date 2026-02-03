import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SyncDashboard } from './SyncDashboard';
import { SyncStatusService } from '../services/SyncStatusService';

// Mock SyncStatusService
jest.mock('../services/SyncStatusService');

describe('SyncDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SyncStatusService.getStats as jest.Mock).mockReturnValue({
      totalItems: 10,
      successfulItems: 6,
      failedItems: 2,
      pendingItems: 2,
      syncingItems: 0,
      successRate: 75,
      averageSyncTime: 1500,
      lastSyncAt: Date.now(),
      nextSyncAt: Date.now() + 10000,
    });
    (SyncStatusService.getProgress as jest.Mock).mockReturnValue(80);
    (SyncStatusService.getQueue as jest.Mock).mockReturnValue([]);
    (SyncStatusService.getHistory as jest.Mock).mockReturnValue([]);
  });

  it('should render overview tab by default', () => {
    render(<SyncDashboard />);

    expect(screen.getByText('Overview')).toBeTruthy();
  });

  it('should display sync progress', () => {
    render(<SyncDashboard />);

    expect(screen.getByText(/80% Complete/)).toBeTruthy();
  });

  it('should display statistics', () => {
    render(<SyncDashboard />);

    expect(screen.getByText('10')).toBeTruthy(); // Total Items
    expect(screen.getByText('75')).toBeTruthy(); // Success Rate
  });

  it('should switch to queue tab', async () => {
    (SyncStatusService.getQueue as jest.Mock).mockReturnValue([
      {
        id: 'queue-1',
        readingId: 'reading-123',
        meterCode: 'METER-001',
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 0,
      },
    ]);

    render(<SyncDashboard />);

    const queueTab = screen.getByText(/Queue/);
    fireEvent.press(queueTab);

    await waitFor(() => {
      expect(screen.getByText('METER-001')).toBeTruthy();
    });
  });

  it('should switch to history tab', async () => {
    (SyncStatusService.getHistory as jest.Mock).mockReturnValue([
      {
        id: 'history-1',
        readingId: 'reading-123',
        meterCode: 'METER-001',
        timestamp: Date.now(),
        status: 'success',
        duration: 1000,
      },
    ]);

    render(<SyncDashboard />);

    const historyTab = screen.getByText('History');
    fireEvent.press(historyTab);

    await waitFor(() => {
      expect(screen.getByText('METER-001')).toBeTruthy();
    });
  });

  it('should display timing information', () => {
    render(<SyncDashboard />);

    expect(screen.getByText('Average Sync Time:')).toBeTruthy();
    expect(screen.getByText('Last Sync:')).toBeTruthy();
  });

  it('should show retry failed button when items failed', () => {
    render(<SyncDashboard />);

    const retryButton = screen.getByText('Retry Failed Items');
    expect(retryButton).toBeTruthy();
  });

  it('should call onRetryFailed when retry button pressed', async () => {
    const onRetryFailed = jest.fn().mockResolvedValue(undefined);
    (SyncStatusService.getFailedItems as jest.Mock).mockReturnValue([
      {
        id: 'queue-1',
        readingId: 'reading-123',
        meterCode: 'METER-001',
        timestamp: Date.now(),
        status: 'failed',
        retryCount: 1,
      },
    ]);

    render(<SyncDashboard onRetryFailed={onRetryFailed} />);

    const retryButton = screen.getByText('Retry Failed Items');
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(onRetryFailed).toHaveBeenCalled();
    });
  });

  it('should auto-refresh stats', async () => {
    const { rerender } = render(
      <SyncDashboard refreshInterval={100} />
    );

    await waitFor(() => {
      expect(SyncStatusService.getStats).toHaveBeenCalled();
    });
  });

  it('should display empty queue message', async () => {
    (SyncStatusService.getQueue as jest.Mock).mockReturnValue([]);

    render(<SyncDashboard />);

    const queueTab = screen.getByText(/Queue/);
    fireEvent.press(queueTab);

    await waitFor(() => {
      expect(screen.getByText('Queue is empty')).toBeTruthy();
    });
  });

  it('should display queue items with status badges', async () => {
    (SyncStatusService.getQueue as jest.Mock).mockReturnValue([
      {
        id: 'queue-1',
        readingId: 'reading-123',
        meterCode: 'METER-001',
        timestamp: Date.now(),
        status: 'syncing',
        retryCount: 0,
      },
      {
        id: 'queue-2',
        readingId: 'reading-124',
        meterCode: 'METER-002',
        timestamp: Date.now(),
        status: 'pending',
        retryCount: 0,
      },
    ]);

    render(<SyncDashboard />);

    const queueTab = screen.getByText(/Queue/);
    fireEvent.press(queueTab);

    await waitFor(() => {
      expect(screen.getAllByText(/METER-/)).toHaveLength(2);
    });
  });
});
