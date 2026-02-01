/**
 * SyncStatusBadge - Visual offline sync indicator
 * Story 3.4: Stockage local hors-ligne
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { OfflineQueue, SyncStatus } from '../services/OfflineQueue';

interface SyncStatusBadgeProps {
  size?: 'small' | 'medium' | 'large';
}

const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({ size = 'medium' }) => {
  const [status, setStatus] = useState<SyncStatus>(OfflineQueue.getStatus());
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = OfflineQueue.onStatusChange((newStatus) => {
      setStatus(newStatus);
      setPendingCount(OfflineQueue.getPendingCount());
    });

    setPendingCount(OfflineQueue.getPendingCount());
    return unsubscribe;
  }, []);

  const getColor = (): string => {
    switch (status) {
      case SyncStatus.IDLE:
        return '#4caf50'; // Green
      case SyncStatus.SYNCING:
        return '#2196F3'; // Blue
      case SyncStatus.PENDING:
        return '#ff9800'; // Orange
      case SyncStatus.OFFLINE:
        return '#757575'; // Gray
      case SyncStatus.ERROR:
        return '#f44336'; // Red
      default:
        return '#9c27b0'; // Purple
    }
  };

  const getText = (): string => {
    switch (status) {
      case SyncStatus.IDLE:
        return 'Synchronisé';
      case SyncStatus.SYNCING:
        return 'Synchro...';
      case SyncStatus.PENDING:
        return `${pendingCount} en attente`;
      case SyncStatus.OFFLINE:
        return 'Hors-ligne';
      case SyncStatus.ERROR:
        return `${pendingCount} erreurs`;
      default:
        return '?';
    }
  };

  const fontSize = size === 'small' ? 11 : size === 'large' ? 15 : 13;
  const padding = size === 'small' ? 4 : size === 'large' ? 12 : 8;

  return (
    <View style={[styles.badge, { backgroundColor: getColor(), padding }]}>
      {status === SyncStatus.SYNCING ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={[styles.text, { fontSize }]}>{getText()}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 24,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default SyncStatusBadge;
