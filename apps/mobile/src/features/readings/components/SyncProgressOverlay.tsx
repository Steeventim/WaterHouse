/**
 * SyncProgressOverlay - Full-screen sync progress indicator
 * Story 3.5: Indicateur de statut de synchronisation
 * Shows detailed sync progress with retry options
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { OfflineQueue, SyncStatus } from '../services/OfflineQueue';
import { ReadingStorage } from '../services/OfflineReadingStorage';

export interface SyncProgressOverlayProps {
  visible: boolean;
  onClose: () => void;
}

const SyncProgressOverlay: React.FC<SyncProgressOverlayProps> = ({
  visible,
  onClose,
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(OfflineQueue.getStatus());
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = OfflineQueue.onStatusChange((status) => {
      setSyncStatus(status);
      setPendingCount(OfflineQueue.getPendingCount());
    });

    setPendingCount(OfflineQueue.getPendingCount());
    return unsubscribe;
  }, []);

  const handleRetrySync = async () => {
    setIsSyncing(true);
    try {
      await OfflineQueue.sync();
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusMessage = () => {
    switch (syncStatus) {
      case SyncStatus.IDLE:
        return 'Toutes les lectures sont synchronisées';
      case SyncStatus.SYNCING:
        return `Synchronisation en cours...`;
      case SyncStatus.PENDING:
        return `${pendingCount} lecture(s) en attente de synchronisation`;
      case SyncStatus.OFFLINE:
        return 'Mode hors-ligne - Les lectures seront synchronisées à la reconnexion';
      case SyncStatus.ERROR:
        return `Erreur de synchronisation pour ${pendingCount} lecture(s)`;
      default:
        return 'Statut inconnu';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case SyncStatus.IDLE:
        return '✓';
      case SyncStatus.SYNCING:
        return '↻';
      case SyncStatus.PENDING:
        return '⏳';
      case SyncStatus.OFFLINE:
        return '✗';
      case SyncStatus.ERROR:
        return '⚠';
      default:
        return '?';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case SyncStatus.IDLE:
        return '#4caf50';
      case SyncStatus.SYNCING:
        return '#2196F3';
      case SyncStatus.PENDING:
        return '#ff9800';
      case SyncStatus.OFFLINE:
        return '#757575';
      case SyncStatus.ERROR:
        return '#f44336';
      default:
        return '#9c27b0';
    }
  };

  const unsyncedReadings = ReadingStorage.getUnsyncedReadings();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>État de synchronisation</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Status Card */}
          <View style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}>
            <View style={styles.statusHeader}>
              {syncStatus === SyncStatus.SYNCING ? (
                <ActivityIndicator size="large" color={getStatusColor()} />
              ) : (
                <Text style={[styles.statusIcon, { color: getStatusColor() }]}>
                  {getStatusIcon()}
                </Text>
              )}
              <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
            </View>
          </View>

          {/* Unsynced Readings List */}
          {unsyncedReadings.length > 0 && (
            <ScrollView style={styles.readingsList}>
              <Text style={styles.sectionTitle}>Lectures en attente:</Text>
              {unsyncedReadings.map((reading) => (
                <View key={reading.id} style={styles.readingItem}>
                  <View style={styles.readingInfo}>
                    <Text style={styles.readingMeter}>Compteur: {reading.meterId}</Text>
                    <Text style={styles.readingValue}>
                      Index: {reading.reading}
                    </Text>
                    <Text style={styles.readingTime}>
                      {new Date(reading.timestamp).toLocaleString('fr-FR')}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.readingStatus,
                      { backgroundColor: reading.synced ? '#e8f5e9' : '#fff3e0' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.readingStatusText,
                        { color: reading.synced ? '#4caf50' : '#ff9800' },
                      ]}
                    >
                      {reading.synced ? '✓' : '⏳'}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {(syncStatus === SyncStatus.ERROR || syncStatus === SyncStatus.PENDING) && (
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={handleRetrySync}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Réessayer la synchronisation</Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.button, styles.closeButtonBottom]}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 24,
    color: '#757575',
  },
  statusCard: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  statusMessage: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  readingsList: {
    maxHeight: 300,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 12,
  },
  readingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  readingInfo: {
    flex: 1,
  },
  readingMeter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
  },
  readingTime: {
    fontSize: 11,
    color: '#999',
  },
  readingStatus: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  readingStatusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  retryButton: {
    backgroundColor: '#2196F3',
  },
  closeButtonBottom: {
    backgroundColor: '#757575',
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default SyncProgressOverlay;
