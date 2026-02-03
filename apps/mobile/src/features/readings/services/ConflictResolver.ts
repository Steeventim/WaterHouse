/**
 * ConflictResolver - Detects and resolves sync conflicts
 * Story 4.2: Résolution manuelle des conflits
 * Handles version comparison and conflict resolution
 */

import { OfflineReading } from './OfflineReadingStorage';

export interface ReadingConflict {
  id: string;
  meterId: string;
  localVersion: OfflineReading;
  remoteVersion: OfflineReading;
  detectedAt: number;
  resolved: boolean;
  resolutionChoice?: 'local' | 'remote' | 'merge';
  mergedData?: OfflineReading;
  resolutionNotes?: string;
  resolvedBy?: string;
  resolvedAt?: number;
}

export interface ConflictStats {
  totalConflicts: number;
  resolvedCount: number;
  pendingCount: number;
}

export class ConflictResolver {
  private static conflicts: Map<string, ReadingConflict> = new Map();

  /**
   * Detect conflict between local and remote readings
   */
  static detectConflict(
    localReading: OfflineReading,
    remoteReading: OfflineReading
  ): ReadingConflict {
    const conflict: ReadingConflict = {
      id: `conflict_${localReading.id}_${Date.now()}`,
      meterId: localReading.meterId,
      localVersion: localReading,
      remoteVersion: remoteReading,
      detectedAt: Date.now(),
      resolved: false,
    };

    this.conflicts.set(conflict.id, conflict);
    console.log(`[ConflictResolver] Conflict detected: ${conflict.id}`);

    return conflict;
  }

  /**
   * Get all pending conflicts
   */
  static getPendingConflicts(): ReadingConflict[] {
    return Array.from(this.conflicts.values()).filter((c) => !c.resolved);
  }

  /**
   * Get all resolved conflicts
   */
  static getResolvedConflicts(): ReadingConflict[] {
    return Array.from(this.conflicts.values()).filter((c) => c.resolved);
  }

  /**
   * Resolve conflict by choosing version
   */
  static resolveConflict(
    conflictId: string,
    choice: 'local' | 'remote' | 'merge',
    mergedData?: OfflineReading,
    notes?: string
  ): ReadingConflict | null {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      return null;
    }

    conflict.resolved = true;
    conflict.resolutionChoice = choice;
    conflict.resolutionNotes = notes;
    conflict.resolvedAt = Date.now();
    conflict.resolvedBy = 'user'; // In production, would be actual user ID

    if (choice === 'merge' && mergedData) {
      conflict.mergedData = mergedData;
    }

    console.log(
      `[ConflictResolver] Conflict ${conflictId} resolved with choice: ${choice}`
    );

    return conflict;
  }

  /**
   * Get conflict by ID
   */
  static getConflict(conflictId: string): ReadingConflict | null {
    return this.conflicts.get(conflictId) || null;
  }

  /**
   * Get statistics
   */
  static getStats(): ConflictStats {
    const allConflicts = Array.from(this.conflicts.values());
    const resolved = allConflicts.filter((c) => c.resolved);

    return {
      totalConflicts: allConflicts.length,
      resolvedCount: resolved.length,
      pendingCount: allConflicts.length - resolved.length,
    };
  }

  /**
   * Clear all conflicts (e.g., after sync completion)
   */
  static clearConflicts(): void {
    this.conflicts.clear();
  }

  /**
   * Detect conflicts by comparing readings
   * Returns array of conflicts found
   */
  static compareReadings(
    local: OfflineReading[],
    remote: OfflineReading[]
  ): ReadingConflict[] {
    const conflicts: ReadingConflict[] = [];
    const remoteMap = new Map(remote.map((r) => [r.id, r]));

    for (const localReading of local) {
      const remoteReading = remoteMap.get(localReading.id);
      if (remoteReading && this.hasConflict(localReading, remoteReading)) {
        conflicts.push(this.detectConflict(localReading, remoteReading));
      }
    }

    return conflicts;
  }

  /**
   * Check if two readings conflict
   */
  private static hasConflict(local: OfflineReading, remote: OfflineReading): boolean {
    // Conflict if both have been modified and have different values
    return (
      local.reading !== remote.reading ||
      local.timestamp !== remote.timestamp ||
      (local.overrideComment !== remote.overrideComment &&
        !!local.overrideComment &&
        !!remote.overrideComment)
    );
  }

  /**
   * Suggest auto-resolution (uses most recent timestamp)
   */
  static suggestAutoResolution(conflict: ReadingConflict): 'local' | 'remote' {
    if (conflict.localVersion.timestamp > conflict.remoteVersion.timestamp) {
      return 'local';
    }
    return 'remote';
  }

  /**
   * Create merged version
   */
  static createMergedVersion(
    conflict: ReadingConflict,
    strategy: 'most-recent' | 'highest-value' | 'average'
  ): OfflineReading {
    const { localVersion, remoteVersion } = conflict;

    let mergedReading = localVersion.reading;
    let mergedTimestamp = localVersion.timestamp;

    switch (strategy) {
      case 'most-recent':
        if (remoteVersion.timestamp > localVersion.timestamp) {
          mergedReading = remoteVersion.reading;
          mergedTimestamp = remoteVersion.timestamp;
        }
        break;

      case 'highest-value':
        if (remoteVersion.reading > localVersion.reading) {
          mergedReading = remoteVersion.reading;
        }
        break;

      case 'average':
        mergedReading = (localVersion.reading + remoteVersion.reading) / 2;
        mergedTimestamp = Math.max(localVersion.timestamp, remoteVersion.timestamp);
        break;
    }

    return {
      ...localVersion,
      reading: mergedReading,
      timestamp: mergedTimestamp,
      synced: true,
    };
  }
}
