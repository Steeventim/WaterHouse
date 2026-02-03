/**
 * ConflictDetectionService Tests
 * Story 4.2: Résolution manuelle des conflits
 */

import {
  ConflictDetectionService,
  ConflictType,
  ConflictResolution,
  RemoteReading,
} from '../ConflictDetectionService';
import { OfflineReading } from '../OfflineReadingStorage';

describe('ConflictDetectionService', () => {
  const baseLocalReading: OfflineReading = {
    id: 'local-1',
    meterId: 'meter-123',
    reading: 1000,
    timestamp: Date.now(),
    photoPath: '/path/to/photo.jpg',
    synced: false,
  };

  const baseRemoteReading: RemoteReading = {
    id: 'remote-1',
    meterId: 'meter-123',
    reading: 1000,
    timestamp: Date.now(),
    photoUrl: 'https://example.com/photo.jpg',
    syncedAt: Date.now(),
    syncedBy: 'user-456',
  };

  beforeEach(() => {
    // Clear any previous conflicts
    ConflictDetectionService.getUnresolvedConflicts().forEach((conflict) => {
      ConflictDetectionService.resolveConflict(
        conflict.id,
        ConflictResolution.SKIP,
        'test-cleanup'
      );
    });
  });

  describe('detectConflicts', () => {
    it('should detect DUPLICATE conflict when timestamps are within 1 minute', () => {
      const localReading = { ...baseLocalReading };
      const remoteReading = { ...baseRemoteReading, timestamp: localReading.timestamp + 30000 }; // 30 seconds later

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);

      expect(conflict).not.toBeNull();
      expect(conflict?.conflictType).toBe(ConflictType.DUPLICATE);
      expect(conflict?.meterId).toBe('meter-123');
      expect(conflict?.localReading).toBe(localReading);
      expect(conflict?.remoteReading).toBe(remoteReading);
    });

    it('should detect NEWER_REMOTE conflict when remote timestamp is newer', () => {
      const localReading = { ...baseLocalReading, timestamp: Date.now() - 120000 }; // 2 minutes ago
      const remoteReading = { ...baseRemoteReading, timestamp: Date.now() }; // now

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);

      expect(conflict).not.toBeNull();
      expect(conflict?.conflictType).toBe(ConflictType.NEWER_REMOTE);
    });

    it('should detect DIFFERENT_VALUE conflict when values differ at same time', () => {
      const localReading = { ...baseLocalReading, reading: 1000 };
      const remoteReading = { ...baseRemoteReading, reading: 1050, timestamp: localReading.timestamp };

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);

      expect(conflict).not.toBeNull();
      expect(conflict?.conflictType).toBe(ConflictType.DIFFERENT_VALUE);
    });

    it('should return null when readings are identical', () => {
      const localReading = { ...baseLocalReading };
      const remoteReading = { ...baseRemoteReading, timestamp: localReading.timestamp };

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);

      expect(conflict).toBeNull();
    });

    it('should return null when readings are for different meters', () => {
      const localReading = { ...baseLocalReading, meterId: 'meter-111' };
      const remoteReading = { ...baseRemoteReading, meterId: 'meter-222' };

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);

      expect(conflict).toBeNull();
    });

    it('should return null when timestamps differ by more than 1 minute', () => {
      const localReading = { ...baseLocalReading, timestamp: Date.now() };
      const remoteReading = { ...baseRemoteReading, timestamp: Date.now() + 120000 }; // 2 minutes later

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);

      expect(conflict).toBeNull();
    });
  });

  describe('resolveConflict', () => {
    it('should mark conflict as resolved and record audit trail', () => {
      const localReading = { ...baseLocalReading };
      const remoteReading = { ...baseRemoteReading, timestamp: localReading.timestamp + 30000 };

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);
      expect(conflict).not.toBeNull();
      if (!conflict) return;

      ConflictDetectionService.resolveConflict(
        conflict.id,
        ConflictResolution.KEEP_LOCAL,
        'user-123',
        'Local reading is more accurate'
      );

      const unresolved = ConflictDetectionService.getUnresolvedConflicts();
      expect(unresolved).not.toContainEqual(expect.objectContaining({ id: conflict.id }));

      const history = ConflictDetectionService.getResolutionHistory();
      const record = history.find((r) => r.conflictId === conflict.id);
      expect(record).toBeDefined();
      expect(record?.resolution).toBe(ConflictResolution.KEEP_LOCAL);
      expect(record?.resolvedBy).toBe('user-123');
      expect(record?.notes).toBe('Local reading is more accurate');
    });

    it('should handle KEEP_REMOTE resolution', () => {
      const localReading = { ...baseLocalReading };
      const remoteReading = { ...baseRemoteReading, timestamp: localReading.timestamp + 30000 };

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);
      if (!conflict) return;
      
      ConflictDetectionService.resolveConflict(
        conflict.id,
        ConflictResolution.KEEP_REMOTE,
        'user-123'
      );

      const history = ConflictDetectionService.getResolutionHistory();
      const record = history.find((r) => r.conflictId === conflict.id);
      expect(record?.resolution).toBe(ConflictResolution.KEEP_REMOTE);
    });

    it('should handle SKIP resolution', () => {
      const localReading = { ...baseLocalReading };
      const remoteReading = { ...baseRemoteReading, timestamp: localReading.timestamp + 30000 };

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);
      if (!conflict) return;
      
      ConflictDetectionService.resolveConflict(
        conflict.id,
        ConflictResolution.SKIP,
        'user-123',
        'Will decide later'
      );

      const history = ConflictDetectionService.getResolutionHistory();
      const record = history.find((r) => r.conflictId === conflict.id);
      expect(record?.resolution).toBe(ConflictResolution.SKIP);
      expect(record?.notes).toBe('Will decide later');
    });
  });

  describe('getUnresolvedConflicts', () => {
    it('should return all unresolved conflicts', () => {
      const localReading1 = { ...baseLocalReading, id: 'local-1', meterId: 'meter-1' };
      const remoteReading1 = { ...baseRemoteReading, id: 'remote-1', meterId: 'meter-1', timestamp: localReading1.timestamp + 30000 };

      const localReading2 = { ...baseLocalReading, id: 'local-2', meterId: 'meter-2' };
      const remoteReading2 = { ...baseRemoteReading, id: 'remote-2', meterId: 'meter-2', timestamp: localReading2.timestamp + 30000 };

      ConflictDetectionService.detectConflicts(localReading1, remoteReading1);
      ConflictDetectionService.detectConflicts(localReading2, remoteReading2);

      const unresolved = ConflictDetectionService.getUnresolvedConflicts();
      expect(unresolved).toHaveLength(2);
    });

    it('should not return resolved conflicts', () => {
      const localReading = { ...baseLocalReading };
      const remoteReading = { ...baseRemoteReading, timestamp: localReading.timestamp + 30000 };

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);
      if (!conflict) return;
      ConflictDetectionService.resolveConflict(conflict.id, ConflictResolution.KEEP_LOCAL, 'user-123');

      const unresolved = ConflictDetectionService.getUnresolvedConflicts();
      expect(unresolved).not.toContainEqual(expect.objectContaining({ id: conflict.id }));
    });
  });

  describe('getResolutionHistory', () => {
    it('should return all resolution records', () => {
      const localReading1 = { ...baseLocalReading, id: 'local-1', meterId: 'meter-1' };
      const remoteReading1 = { ...baseRemoteReading, id: 'remote-1', meterId: 'meter-1', timestamp: localReading1.timestamp + 30000 };

      const conflict1 = ConflictDetectionService.detectConflicts(localReading1, remoteReading1);
      if (!conflict1) return;
      ConflictDetectionService.resolveConflict(conflict1.id, ConflictResolution.KEEP_LOCAL, 'user-123');

      const localReading2 = { ...baseLocalReading, id: 'local-2', meterId: 'meter-2' };
      const remoteReading2 = { ...baseRemoteReading, id: 'remote-2', meterId: 'meter-2', timestamp: localReading2.timestamp + 30000 };

      const conflict2 = ConflictDetectionService.detectConflicts(localReading2, remoteReading2);
      if (!conflict2) return;
      ConflictDetectionService.resolveConflict(conflict2.id, ConflictResolution.KEEP_REMOTE, 'user-456');

      const history = ConflictDetectionService.getResolutionHistory();
      expect(history.length).toBeGreaterThanOrEqual(2);
      
      const record1 = history.find((r) => r.conflictId === conflict1.id);
      const record2 = history.find((r) => r.conflictId === conflict2.id);
      
      expect(record1?.resolution).toBe(ConflictResolution.KEEP_LOCAL);
      expect(record1?.resolvedBy).toBe('user-123');
      
      expect(record2?.resolution).toBe(ConflictResolution.KEEP_REMOTE);
      expect(record2?.resolvedBy).toBe('user-456');
    });
  });

  describe('clearOldConflicts', () => {
    it('should remove resolved conflicts older than 30 days', () => {
      const localReading = { ...baseLocalReading };
      const remoteReading = { ...baseRemoteReading, timestamp: localReading.timestamp + 30000 };

      const conflict = ConflictDetectionService.detectConflicts(localReading, remoteReading);
      if (!conflict) return;
      ConflictDetectionService.resolveConflict(conflict.id, ConflictResolution.KEEP_LOCAL, 'user-123');

      // Manually set old timestamp
      const history = ConflictDetectionService.getResolutionHistory();
      const record = history.find((r) => r.conflictId === conflict.id);
      if (record) {
        record.resolvedAt = Date.now() - 31 * 24 * 60 * 60 * 1000; // 31 days ago
      }

      ConflictDetectionService.clearOldConflicts();

      const newHistory = ConflictDetectionService.getResolutionHistory();
      const oldRecord = newHistory.find((r) => r.conflictId === conflict.id);
      expect(oldRecord).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('should return statistics by conflict type', () => {
      const localReading1 = { ...baseLocalReading, id: 'local-1', meterId: 'meter-1' };
      const remoteReading1 = { ...baseRemoteReading, id: 'remote-1', meterId: 'meter-1', timestamp: localReading1.timestamp + 30000 };
      ConflictDetectionService.detectConflicts(localReading1, remoteReading1); // DUPLICATE

      const localReading2 = { ...baseLocalReading, id: 'local-2', meterId: 'meter-2', timestamp: Date.now() - 120000 };
      const remoteReading2 = { ...baseRemoteReading, id: 'remote-2', meterId: 'meter-2', timestamp: Date.now() };
      ConflictDetectionService.detectConflicts(localReading2, remoteReading2); // NEWER_REMOTE

      const stats = ConflictDetectionService.getStats();
      
      expect(stats.byType.duplicate).toBeGreaterThanOrEqual(1);
      expect(stats.byType.newerRemote).toBeGreaterThanOrEqual(1);
      expect(stats.unresolved).toBeGreaterThanOrEqual(2);
    });
  });
});
