import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SyncRetryStatus } from './SyncRetryStatus';
import { SyncRetryService } from '../services/SyncRetryService';

// Mock SyncRetryService
jest.mock('../services/SyncRetryService');

describe('SyncRetryStatus', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show success message when no failed syncs', () => {
    (SyncRetryService.getFailedSync as jest.Mock).mockReturnValue(null);

    render(
      <SyncRetryStatus
        readingId="reading-123"
        visible={true}
        onClose={jest.fn()}
      />
    );

    const successMessage = screen.getByText(
      /All readings have been synchronized successfully/
    );
    expect(successMessage).toBeTruthy();
  });

  it('should display failed sync details', () => {
    const mockFailure = {
      readingId: 'reading-123',
      meterCode: 'METER-001',
      value: 150,
      timestamp: Date.now(),
      failureReason: 'Network timeout',
      failureCount: 2,
      lastFailureAt: Date.now(),
    };

    (SyncRetryService.getFailedSync as jest.Mock).mockReturnValue(
      mockFailure
    );
    (SyncRetryService.getRetryStatus as jest.Mock).mockReturnValue({
      isRetrying: true,
      attemptCount: 1,
      nextRetryAt: Date.now() + 10000,
    });

    render(
      <SyncRetryStatus
        readingId="reading-123"
        visible={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('reading-123')).toBeTruthy();
    expect(screen.getByText('METER-001')).toBeTruthy();
    expect(screen.getByText(/150 units/)).toBeTruthy();
    expect(screen.getByText('Network timeout')).toBeTruthy();
  });

  it('should show retry status when retrying', () => {
    const mockFailure = {
      readingId: 'reading-123',
      meterCode: 'METER-001',
      value: 150,
      timestamp: Date.now(),
      failureReason: 'Network timeout',
      failureCount: 1,
      lastFailureAt: Date.now(),
    };

    (SyncRetryService.getFailedSync as jest.Mock).mockReturnValue(
      mockFailure
    );
    (SyncRetryService.getRetryStatus as jest.Mock).mockReturnValue({
      isRetrying: true,
      attemptCount: 1,
      nextRetryAt: Date.now() + 10000,
    });

    render(
      <SyncRetryStatus
        readingId="reading-123"
        visible={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText(/Automatic retry scheduled/)).toBeTruthy();
  });

  it('should show failed status when not retrying', () => {
    const mockFailure = {
      readingId: 'reading-123',
      meterCode: 'METER-001',
      value: 150,
      timestamp: Date.now(),
      failureReason: 'Max retries exceeded',
      failureCount: 5,
      lastFailureAt: Date.now(),
    };

    (SyncRetryService.getFailedSync as jest.Mock).mockReturnValue(
      mockFailure
    );
    (SyncRetryService.getRetryStatus as jest.Mock).mockReturnValue({
      isRetrying: false,
      attemptCount: 5,
    });

    render(
      <SyncRetryStatus
        readingId="reading-123"
        visible={true}
        onClose={jest.fn()}
      />
    );

    expect(screen.getByText('Sync failed')).toBeTruthy();
  });

  it('should handle manual retry', async () => {
    const mockFailure = {
      readingId: 'reading-123',
      meterCode: 'METER-001',
      value: 150,
      timestamp: Date.now(),
      failureReason: 'Network timeout',
      failureCount: 1,
      lastFailureAt: Date.now(),
    };

    (SyncRetryService.getFailedSync as jest.Mock).mockReturnValue(
      mockFailure
    );
    (SyncRetryService.getRetryStatus as jest.Mock).mockReturnValue({
      isRetrying: false,
      attemptCount: 1,
    });
    (SyncRetryService.retryAllFailedSyncs as jest.Mock).mockResolvedValue(1);

    const onClose = jest.fn();

    const { rerender } = render(
      <SyncRetryStatus
        readingId="reading-123"
        visible={true}
        onClose={onClose}
      />
    );

    const retryButton = screen.getByText('Retry Now');
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(SyncRetryService.retryAllFailedSyncs).toHaveBeenCalled();
    });
  });

  it('should handle retry error', async () => {
    const mockFailure = {
      readingId: 'reading-123',
      meterCode: 'METER-001',
      value: 150,
      timestamp: Date.now(),
      failureReason: 'Network timeout',
      failureCount: 1,
      lastFailureAt: Date.now(),
    };

    (SyncRetryService.getFailedSync as jest.Mock).mockReturnValue(
      mockFailure
    );
    (SyncRetryService.getRetryStatus as jest.Mock).mockReturnValue({
      isRetrying: false,
      attemptCount: 1,
    });
    (SyncRetryService.retryAllFailedSyncs as jest.Mock).mockResolvedValue(0);

    render(
      <SyncRetryStatus
        readingId="reading-123"
        visible={true}
        onClose={jest.fn()}
      />
    );

    const retryButton = screen.getByText('Retry Now');
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Retry failed. Please check your connection/)
      ).toBeTruthy();
    });
  });

  it('should close modal on close button', () => {
    (SyncRetryService.getFailedSync as jest.Mock).mockReturnValue(null);
    const onClose = jest.fn();

    render(
      <SyncRetryStatus
        readingId="reading-123"
        visible={true}
        onClose={onClose}
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.press(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
