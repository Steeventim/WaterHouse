/**
 * ConflictResolutionModal Tests
 * Story 4.2: Résolution manuelle des conflits
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ConflictResolutionModal from '../ConflictResolutionModal';
import {
  ConflictType,
  ConflictResolution,
  ReadingConflict,
} from '../../services/ConflictDetectionService';

describe('ConflictResolutionModal', () => {
  const mockConflict: ReadingConflict = {
    id: 'conflict-1',
    meterId: 'meter-123',
    conflictType: ConflictType.DIFFERENT_VALUE,
    localReading: {
      id: 'local-1',
      meterId: 'meter-123',
      reading: 1000,
      timestamp: Date.now(),
      photoPath: '/local/photo.jpg',
      synced: false,
    },
    remoteReading: {
      id: 'remote-1',
      meterId: 'meter-123',
      reading: 1050,
      timestamp: Date.now(),
      photoUrl: 'https://example.com/photo.jpg',
      syncedAt: Date.now(),
      syncedBy: 'user-456',
    },
    detectedAt: Date.now(),
  };

  const mockOnResolve = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render conflict details', () => {
    const { getByText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Conflit de synchronisation')).toBeTruthy();
    expect(getByText('Valeurs différentes')).toBeTruthy();
    expect(getByText('meter-123')).toBeTruthy();
    expect(getByText('1000')).toBeTruthy();
    expect(getByText('1050')).toBeTruthy();
  });

  it('should render resolution options', () => {
    const { getByText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Garder la version locale')).toBeTruthy();
    expect(getByText('Garder la version distante')).toBeTruthy();
    expect(getByText('Ignorer ce conflit')).toBeTruthy();
  });

  it('should enable resolve button when option is selected', () => {
    const { getByText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    const resolveButton = getByText('Résoudre');
    expect(resolveButton.props.accessibilityState?.disabled).toBe(true);

    fireEvent.press(getByText('Garder la version locale'));
    
    expect(resolveButton.props.accessibilityState?.disabled).toBe(false);
  });

  it('should show notes input when resolution is selected', () => {
    const { getByText, getByPlaceholderText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Garder la version locale'));

    const notesInput = getByPlaceholderText('Ajouter une explication pour la piste d\'audit...');
    expect(notesInput).toBeTruthy();
  });

  it('should call onResolve with KEEP_LOCAL resolution', async () => {
    const { getByText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Garder la version locale'));
    fireEvent.press(getByText('Résoudre'));

    await waitFor(() => {
      expect(mockOnResolve).toHaveBeenCalledWith(ConflictResolution.KEEP_LOCAL, undefined);
    });
  });

  it('should call onResolve with KEEP_REMOTE resolution', async () => {
    const { getByText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Garder la version distante'));
    fireEvent.press(getByText('Résoudre'));

    await waitFor(() => {
      expect(mockOnResolve).toHaveBeenCalledWith(ConflictResolution.KEEP_REMOTE, undefined);
    });
  });

  it('should call onResolve with SKIP resolution', async () => {
    const { getByText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Ignorer ce conflit'));
    fireEvent.press(getByText('Résoudre'));

    await waitFor(() => {
      expect(mockOnResolve).toHaveBeenCalledWith(ConflictResolution.SKIP, undefined);
    });
  });

  it('should include notes when provided', async () => {
    const { getByText, getByPlaceholderText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Garder la version locale'));
    
    const notesInput = getByPlaceholderText('Ajouter une explication pour la piste d\'audit...');
    fireEvent.changeText(notesInput, 'Version locale est plus précise');

    fireEvent.press(getByText('Résoudre'));

    await waitFor(() => {
      expect(mockOnResolve).toHaveBeenCalledWith(
        ConflictResolution.KEEP_LOCAL,
        'Version locale est plus précise'
      );
    });
  });

  it('should call onCancel when cancel button is pressed', () => {
    const { getByText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Annuler'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should display DUPLICATE conflict type correctly', () => {
    const duplicateConflict = {
      ...mockConflict,
      conflictType: ConflictType.DUPLICATE,
    };

    const { getByText } = render(
      <ConflictResolutionModal
        conflict={duplicateConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Relevé en double')).toBeTruthy();
  });

  it('should display NEWER_REMOTE conflict type correctly', () => {
    const newerRemoteConflict = {
      ...mockConflict,
      conflictType: ConflictType.NEWER_REMOTE,
    };

    const { getByText } = render(
      <ConflictResolutionModal
        conflict={newerRemoteConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    expect(getByText('Relevé distant plus récent')).toBeTruthy();
  });

  it('should not render when conflict is null', () => {
    const { queryByText } = render(
      <ConflictResolutionModal
        conflict={null}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    expect(queryByText('Conflit de synchronisation')).toBeNull();
  });

  it('should show photo indicators when photos exist', () => {
    const { getAllByText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    const photoIndicators = getAllByText('✓ Disponible');
    expect(photoIndicators).toHaveLength(2); // Local and remote photos
  });

  it('should enforce 500 character limit on notes', () => {
    const { getByText, getByPlaceholderText, getByText: findText } = render(
      <ConflictResolutionModal
        conflict={mockConflict}
        visible={true}
        onResolve={mockOnResolve}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.press(getByText('Garder la version locale'));
    
    const notesInput = getByPlaceholderText('Ajouter une explication pour la piste d\'audit...');
    const longText = 'a'.repeat(600);
    fireEvent.changeText(notesInput, longText);

    // The input should truncate to 500 characters
    expect(findText('500/500')).toBeTruthy();
  });
});
