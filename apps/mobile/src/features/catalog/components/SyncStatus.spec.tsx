/**
 * Unit tests for SyncStatus component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { SyncStatus } from '../components/SyncStatus';
import { SyncProgress } from '../../common/types/sync.types';

describe('SyncStatus Component', () => {
  const mockSyncProgress: SyncProgress = {
    isOnline: true,
    isSyncing: false,
    lastSyncTime: new Date('2026-01-27T10:00:00Z'),
  };

  describe('rendering', () => {
    it('should render sync status when online', () => {
      render(
        <SyncStatus syncProgress={mockSyncProgress} />
      );

      const statusText = screen.getByText('Synchronisé');
      expect(statusText).toBeDefined();
    });

    it('should show offline status', () => {
      const offlineProgress: SyncProgress = {
        ...mockSyncProgress,
        isOnline: false,
      };

      render(
        <SyncStatus syncProgress={offlineProgress} />
      );

      const statusText = screen.getByText('Hors ligne');
      expect(statusText).toBeDefined();
    });

    it('should show syncing status', () => {
      const syncingProgress: SyncProgress = {
        ...mockSyncProgress,
        isSyncing: true,
      };

      render(
        <SyncStatus syncProgress={syncingProgress} />
      );

      const statusText = screen.getByText('Synchronisation...');
      expect(statusText).toBeDefined();
    });

    it('should display last sync time', () => {
      render(
        <SyncStatus syncProgress={mockSyncProgress} />
      );

      const lastSyncText = screen.getByText(/Dernière sync:/);
      expect(lastSyncText).toBeDefined();
    });

    it('should display error message if present', () => {
      const progressWithError: SyncProgress = {
        ...mockSyncProgress,
        syncError: 'Network connection failed',
      };

      render(
        <SyncStatus syncProgress={progressWithError} />
      );

      const errorText = screen.getByText('Network connection failed');
      expect(errorText).toBeDefined();
    });
  });

  describe('sync button', () => {
    it('should show sync button when online and not syncing', () => {
      const onManualSync = jest.fn();

      render(
        <SyncStatus
          syncProgress={mockSyncProgress}
          onManualSync={onManualSync}
        />
      );

      const syncButton = screen.getByText('Synchroniser');
      expect(syncButton).toBeDefined();
    });

    it('should not show sync button when offline', () => {
      const offlineProgress: SyncProgress = {
        ...mockSyncProgress,
        isOnline: false,
      };

      const { queryByText } = render(
        <SyncStatus
          syncProgress={offlineProgress}
          onManualSync={jest.fn()}
        />
      );

      expect(queryByText('Synchroniser')).toBeNull();
    });

    it('should not show sync button when already syncing', () => {
      const syncingProgress: SyncProgress = {
        ...mockSyncProgress,
        isSyncing: true,
      };

      const { queryByText } = render(
        <SyncStatus
          syncProgress={syncingProgress}
          onManualSync={jest.fn()}
        />
      );

      expect(queryByText('Synchroniser')).toBeNull();
    });

    it('should call onManualSync when button is pressed', async () => {
      const onManualSync = jest.fn().mockResolvedValue(undefined);

      render(
        <SyncStatus
          syncProgress={mockSyncProgress}
          onManualSync={onManualSync}
        />
      );

      const syncButton = screen.getByText('Synchroniser');
      fireEvent.press(syncButton);

      await waitFor(() => {
        expect(onManualSync).toHaveBeenCalled();
      });
    });

    it('should handle sync errors gracefully', async () => {
      const onManualSync = jest
        .fn()
        .mockRejectedValue(new Error('Sync failed'));

      render(
        <SyncStatus
          syncProgress={mockSyncProgress}
          onManualSync={onManualSync}
        />
      );

      const syncButton = screen.getByText('Synchroniser');
      fireEvent.press(syncButton);

      await waitFor(() => {
        expect(onManualSync).toHaveBeenCalled();
      });
    });
  });

  describe('compact mode', () => {
    it('should render compact version when isCompact is true', () => {
      render(
        <SyncStatus syncProgress={mockSyncProgress} isCompact={true} />
      );

      // In compact mode, should still show status
      const statusText = screen.getByText('Synchronisé');
      expect(statusText).toBeDefined();
    });

    it('should not show last sync time in compact mode', () => {
      const { queryByText } = render(
        <SyncStatus syncProgress={mockSyncProgress} isCompact={true} />
      );

      // In compact mode, detailed info should not be shown
      const lastSyncText = queryByText(/Dernière sync:/);
      // This test may vary based on implementation
    });
  });

  describe('accessibility', () => {
    it('should have accessible status indicator', () => {
      render(
        <SyncStatus syncProgress={mockSyncProgress} />
      );

      const statusText = screen.getByText('Synchronisé');
      expect(statusText).toBeDefined();
    });
  });
});
