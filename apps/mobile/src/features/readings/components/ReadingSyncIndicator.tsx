/**
 * ReadingSyncIndicator - Individual reading sync status indicator
 * Story 3.5: Indicateur de statut de synchronisation
 * Shows sync status for each reading with retry option
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';

export type ReadingSyncState = 'pending' | 'syncing' | 'synced' | 'failed';

export interface ReadingSyncIndicatorProps {
  status: ReadingSyncState;
  onRetry?: () => Promise<void>;
  showLabel?: boolean;
  compact?: boolean;
}

const ReadingSyncIndicator: React.FC<ReadingSyncIndicatorProps> = ({
  status,
  onRetry,
  showLabel = true,
  compact = false,
}) => {
  const [isRetrying, setIsRetrying] = React.useState(false);

  const handleRetry = async () => {
    if (!onRetry || isRetrying) return;

    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          icon: '✓',
          color: '#4caf50',
          label: 'Synchronisé',
          bgColor: '#e8f5e9',
        };
      case 'syncing':
        return {
          icon: '↻',
          color: '#2196F3',
          label: 'Synchronisation...',
          bgColor: '#e3f2fd',
        };
      case 'pending':
        return {
          icon: '⏳',
          color: '#ff9800',
          label: 'En attente',
          bgColor: '#fff3e0',
        };
      case 'failed':
        return {
          icon: '✕',
          color: '#f44336',
          label: 'Échec',
          bgColor: '#ffebee',
        };
      default:
        return {
          icon: '?',
          color: '#757575',
          label: 'Inconnu',
          bgColor: '#f5f5f5',
        };
    }
  };

  const config = getStatusConfig();

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: config.bgColor }]}>
        {status === 'syncing' ? (
          <ActivityIndicator size="small" color={config.color} />
        ) : (
          <Text style={[styles.compactIcon, { color: config.color }]}>{config.icon}</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: config.bgColor }]}>
        {status === 'syncing' || isRetrying ? (
          <ActivityIndicator size="small" color={config.color} />
        ) : (
          <Text style={[styles.icon, { color: config.color }]}>{config.icon}</Text>
        )}
        {showLabel && (
          <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
        )}
      </View>

      {status === 'failed' && onRetry && !isRetrying && (
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  compactContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactIcon: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#2196F3',
    borderRadius: 4,
  },
  retryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ReadingSyncIndicator;
