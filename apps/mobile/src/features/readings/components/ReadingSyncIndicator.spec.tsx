/**
 * Tests for sync indicators
 * Story 3.5: Indicateur de statut de synchronisation
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ReadingSyncIndicator from './ReadingSyncIndicator';
import SyncStatusBadge from './SyncStatusBadge';

describe('ReadingSyncIndicator', () => {
  it('should render synced status', () => {
    const { getByText } = render(<ReadingSyncIndicator status="synced" />);
    expect(getByText('Synchronisé')).toBeDefined();
  });

  it('should render pending status', () => {
    const { getByText } = render(<ReadingSyncIndicator status="pending" />);
    expect(getByText('En attente')).toBeDefined();
  });

  it('should render syncing status', () => {
    const { getByText } = render(<ReadingSyncIndicator status="syncing" />);
    expect(getByText('Synchronisation...')).toBeDefined();
  });

  it('should render failed status with retry button', () => {
    const onRetry = jest.fn();
    const { getByText } = render(
      <ReadingSyncIndicator status="failed" onRetry={onRetry} />
    );

    expect(getByText('Échec')).toBeDefined();
    expect(getByText('Réessayer')).toBeDefined();
  });

  it('should call onRetry when retry button pressed', async () => {
    const onRetry = jest.fn().mockResolvedValue(undefined);
    const { getByText } = render(
      <ReadingSyncIndicator status="failed" onRetry={onRetry} />
    );

    const retryButton = getByText('Réessayer');
    fireEvent.press(retryButton);

    await waitFor(() => {
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  it('should render compact mode', () => {
    const { getByTestId } = render(
      <ReadingSyncIndicator status="synced" compact />
    );

    // In compact mode, label should not be visible
    const component = getByTestId ? getByTestId('sync-indicator') : null;
    expect(component).toBeTruthy();
  });

  it('should hide label when showLabel is false', () => {
    const { queryByText } = render(
      <ReadingSyncIndicator status="synced" showLabel={false} />
    );

    expect(queryByText('Synchronisé')).toBeNull();
  });
});

describe('SyncStatusBadge', () => {
  it('should render with default size', () => {
    const component = render(<SyncStatusBadge />);
    expect(component).toBeDefined();
  });

  it('should render with small size', () => {
    const component = render(<SyncStatusBadge size="small" />);
    expect(component).toBeDefined();
  });

  it('should render with large size', () => {
    const component = render(<SyncStatusBadge size="large" />);
    expect(component).toBeDefined();
  });
});
