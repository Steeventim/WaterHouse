/**
 * SyncStatus Component for WaterHouse mobile application
 * Displays synchronization status and provides manual sync capability
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SyncProgress } from '../../common/types/sync.types';

export interface SyncStatusProps {
  syncProgress?: SyncProgress;
  onManualSync?: () => Promise<void>;
  isCompact?: boolean;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  syncProgress,
  onManualSync,
  isCompact = false,
}) => {
  const [isManualSyncing, setIsManualSyncing] = useState(false);

  const getStatusColor = (): string => {
    if (!syncProgress?.isOnline) {
      return '#EF4444'; // red-500
    }
    if (syncProgress?.isSyncing) {
      return '#3B82F6'; // blue-500
    }
    return '#10B981'; // green-500
  };

  const getStatusText = (): string => {
    if (!syncProgress?.isOnline) {
      return 'Hors ligne';
    }
    if (syncProgress?.isSyncing) {
      return 'Synchronisation...';
    }
    return 'Synchronisé';
  };

  const getStatusIcon = (): string => {
    if (!syncProgress?.isOnline) {
      return '⚠️';
    }
    if (syncProgress?.isSyncing) {
      return '🔄';
    }
    return '✅';
  };

  const handleManualSync = async () => {
    if (!onManualSync || isManualSyncing || syncProgress?.isSyncing) {
      return;
    }

    try {
      setIsManualSyncing(true);
      await onManualSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsManualSyncing(false);
    }
  };

  const lastSyncText = syncProgress?.lastSyncTime
    ? `${syncProgress.lastSyncTime.toLocaleString('fr-FR')}`
    : 'Jamais';

  if (isCompact) {
    return (
      <View style={styles.compactContainer}>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor() },
          ]}
        />
        <Text style={styles.compactStatusText}>{getStatusText()}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statusSection}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        {syncProgress?.lastSyncTime && (
          <Text style={styles.lastSyncText}>
            Dernière sync: {lastSyncText}
          </Text>
        )}

        {syncProgress?.syncError && (
          <Text style={styles.errorText}>{syncProgress.syncError}</Text>
        )}
      </View>

      {syncProgress?.isOnline && !syncProgress?.isSyncing && (
        <TouchableOpacity
          onPress={handleManualSync}
          disabled={isManualSyncing}
          style={[
            styles.syncButton,
            isManualSyncing && styles.syncButtonDisabled,
          ]}
          activeOpacity={0.7}
        >
          {isManualSyncing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.syncButtonText}>Synchroniser</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 8,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    gap: 8,
  },
  statusSection: {
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusIcon: {
    fontSize: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  compactStatusText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  lastSyncText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 8,
    fontStyle: 'italic',
  },
  syncButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  syncButtonDisabled: {
    backgroundColor: '#9CA3AF',
    opacity: 0.6,
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
