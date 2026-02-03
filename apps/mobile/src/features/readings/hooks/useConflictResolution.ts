/**
 * useConflictResolution Hook
 * Story 4.2: Résolution manuelle des conflits
 * Manages conflict detection and resolution workflow
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  ConflictDetectionService,
  ReadingConflict,
  ConflictResolution,
  RemoteReading,
} from '../services/ConflictDetectionService';
import { OfflineReading } from '../services/OfflineReadingStorage';

export interface UseConflictResolutionReturn {
  currentConflict: ReadingConflict | null;
  unresolvedCount: number;
  checkConflict: (localReading: OfflineReading, remoteReading: RemoteReading) => ReadingConflict | null;
  resolveConflict: (conflictId: string, resolution: ConflictResolution, notes?: string) => Promise<void>;
  getNextConflict: () => ReadingConflict | null;
  dismissConflict: () => void;
  showConflictModal: boolean;
  setShowConflictModal: (show: boolean) => void;
}

export const useConflictResolution = (userId?: string): UseConflictResolutionReturn => {
  const [currentConflict, setCurrentConflict] = useState<ReadingConflict | null>(null);
  const [showConflictModal, setShowConflictModal] = useState(false);

  /**
   * Check if a sync operation would create a conflict
   */
  const checkConflict = useCallback(
    (localReading: OfflineReading, remoteReading: RemoteReading): ReadingConflict | null => {
      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);
      
      if (conflict) {
        setCurrentConflict(conflict);
      }
      
      return conflict;
    },
    []
  );

  /**
   * Resolve the current conflict
   */
  const resolveConflict = useCallback(
    async (conflictId: string, resolution: ConflictResolution, notes?: string): Promise<void> => {
      try {
        await ConflictDetectionService.resolveConflict(
          conflictId,
          resolution,
          userId || 'unknown',
          notes
        );

        // Show success feedback
        const resolutionLabel = {
          [ConflictResolution.KEEP_LOCAL]: 'Version locale conservée',
          [ConflictResolution.KEEP_REMOTE]: 'Version distante conservée',
          [ConflictResolution.MERGE]: 'Versions fusionnées',
          [ConflictResolution.SKIP]: 'Conflit ignoré',
        }[resolution];

        Alert.alert('✅ Conflit résolu', resolutionLabel);

        // Move to next conflict or close modal
        const nextConflict = getNextConflict();
        if (nextConflict) {
          setCurrentConflict(nextConflict);
        } else {
          setShowConflictModal(false);
          setCurrentConflict(null);
        }
      } catch (error) {
        Alert.alert(
          '❌ Erreur',
          'Impossible de résoudre le conflit. Veuillez réessayer.'
        );
        console.error('Conflict resolution error:', error);
      }
    },
    [userId]
  );

  /**
   * Get the next unresolved conflict
   */
  const getNextConflict = useCallback((): ReadingConflict | null => {
    const unresolved = ConflictDetectionService.getUnresolvedConflicts();
    return unresolved.length > 0 ? unresolved[0] : null;
  }, []);

  /**
   * Dismiss the conflict modal without resolving
   */
  const dismissConflict = useCallback(() => {
    setShowConflictModal(false);
    setCurrentConflict(null);
  }, []);

  /**
   * Get count of unresolved conflicts
   */
  const unresolvedCount = ConflictDetectionService.getUnresolvedConflicts().length;

  return {
    currentConflict,
    unresolvedCount,
    checkConflict,
    resolveConflict,
    getNextConflict,
    dismissConflict,
    showConflictModal,
    setShowConflictModal,
  };
};
