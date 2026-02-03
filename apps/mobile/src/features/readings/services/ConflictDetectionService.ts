/**
 * ConflictDetectionService - Detects and manages sync conflicts
 * Story 4.2: Résolution manuelle des conflits
 * Identifies conflicts between local and remote readings
 */

import { OfflineReading } from './OfflineReadingStorage';

export interface ReadingConflict {
  id: string;
  meterId: string;
  localReading: OfflineReading;
  remoteReading: RemoteReading;
  conflictType: ConflictType;
  detectedAt: number;
  resolvedAt?: number;
  resolution?: ConflictResolution;
}

export interface RemoteReading {
  id: string;
  meterId: string;
  reading: number;
  timestamp: number;
  photoUrl?: string;
  syncedBy?: string;
  syncedAt: number;
}

export enum ConflictType {
  DUPLICATE = 'duplicate', // Same meter, overlapping timestamps
  NEWER_REMOTE = 'newer_remote', // Remote has newer reading
  DIFFERENT_VALUE = 'different_value', // Different values for same timestamp
}

export enum ConflictResolution {
  KEEP_LOCAL = 'keep_local',
  KEEP_REMOTE = 'keep_remote',
  MERGE = 'merge',
  SKIP = 'skip',
}

export interface ConflictResolutionRecord {
  conflictId: string;
  resolution: ConflictResolution;
  resolvedBy: string;
  resolvedAt: number;
  notes?: string;
}

export class ConflictDetectionService {
  private static conflicts: Map<string, ReadingConflict> = new Map();
  private static resolutionHistory: ConflictResolutionRecord[] = [];

  /**
   * Detect conflicts between local and remote readings
   */
  static detectConflicts(
    localReading: OfflineReading,
    remoteReading: RemoteReading
  ): ReadingConflict | null {
    // Check if readings conflict
    if (localReading.meterId !== remoteReading.meterId) {
      return null;
    }

    let conflictType: ConflictType | null = null;

    // Check for duplicate (same meter within time window)
    const timeDiff = Math.abs(localReading.timestamp - remoteReading.timestamp);
    if (timeDiff < 60000) {
      // Within 1 minute
      conflictType = ConflictType.DUPLICATE;
    } else if (remoteReading.timestamp > localReading.timestamp) {
      // Remote is newer
      conflictType = ConflictType.NEWER_REMOTE;
    } else if (localReading.reading !== remoteReading.reading) {
      // Different values
      conflictType = ConflictType.DIFFERENT_VALUE;
    }

    if (!conflictType) {
      return null;
    }

    const conflict: ReadingConflict = {
      id: `conflict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      meterId: localReading.meterId,
      localReading,
      remoteReading,
      conflictType,
      detectedAt: Date.now(),
    };

    this.conflicts.set(conflict.id, conflict);
    console.log(`[ConflictDetection] Conflict detected: ${conflictType} for meter ${localReading.meterId}`);

    return conflict;
  }

  /**
   * Get all unresolved conflicts
   */
  static getUnresolvedConflicts(): ReadingConflict[] {
    return Array.from(this.conflicts.values()).filter((c) => !c.resolvedAt);
  }

  /**
   * Get conflict by ID
   */
  static getConflict(conflictId: string): ReadingConflict | null {
    return this.conflicts.get(conflictId) || null;
  }

  /**
   * Resolve a conflict
   */
  static resolveConflict(
    conflictId: string,
    resolution: ConflictResolution,
    resolvedBy: string,
    notes?: string
  ): void {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    conflict.resolution = resolution;
    conflict.resolvedAt = Date.now();

    // Record resolution in audit trail
    const record: ConflictResolutionRecord = {
      conflictId,
      resolution,
      resolvedBy,
      resolvedAt: Date.now(),
      notes,
    };

    this.resolutionHistory.push(record);

    console.log(`[ConflictDetection] Conflict ${conflictId} resolved: ${resolution}`);
  }

  /**
   * Get resolution history
   */
  static getResolutionHistory(): ConflictResolutionRecord[] {
    return [...this.resolutionHistory];
  }

  /**
   * Get resolution history for a specific conflict
   */
  static getConflictHistory(conflictId: string): ConflictResolutionRecord | null {
    return this.resolutionHistory.find((r) => r.conflictId === conflictId) || null;
  }

  /**
   * Clear resolved conflicts older than specified days
   */
  static clearOldConflicts(olderThanDays = 30): number {
    const cutoffTime = Date.now() - olderThanDays * 24 * 60 * 60 * 1000;
    let clearedCount = 0;

    for (const [id, conflict] of this.conflicts.entries()) {
      if (conflict.resolvedAt && conflict.resolvedAt < cutoffTime) {
        this.conflicts.delete(id);
        clearedCount++;
      }
    }

    console.log(`[ConflictDetection] Cleared ${clearedCount} old conflicts`);
    return clearedCount;
  }

  /**
   * Get conflict statistics
   */
  static getStats() {
    const all = Array.from(this.conflicts.values());
    const unresolved = all.filter((c) => !c.resolvedAt);
    const resolved = all.filter((c) => c.resolvedAt);

    return {
      total: all.length,
      unresolved: unresolved.length,
      resolved: resolved.length,
      byType: {
        duplicate: all.filter((c) => c.conflictType === ConflictType.DUPLICATE).length,
        newerRemote: all.filter((c) => c.conflictType === ConflictType.NEWER_REMOTE).length,
        differentValue: all.filter((c) => c.conflictType === ConflictType.DIFFERENT_VALUE).length,
      },
    };
  }
}
