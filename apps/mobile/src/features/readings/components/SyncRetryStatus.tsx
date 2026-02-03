import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SyncRetryService, SyncFailure } from '../services/SyncRetryService';

interface SyncRetryStatusProps {
  readingId: string;
  visible: boolean;
  onClose: () => void;
}

export const SyncRetryStatus: React.FC<SyncRetryStatusProps> = ({
  readingId,
  visible,
  onClose,
}) => {
  const [failedSync, setFailedSync] = useState<SyncFailure | null>(null);
  const [retryStatus, setRetryStatus] = useState<{
    isRetrying: boolean;
    attemptCount: number;
    nextRetryAt?: number;
  }>({
    isRetrying: false,
    attemptCount: 0,
    nextRetryAt: undefined,
  });
  const [isRetrying, setIsRetrying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      updateStatus();
      const interval = setInterval(updateStatus, 1000);
      return () => clearInterval(interval);
    }
  }, [visible, readingId]);

  const updateStatus = useCallback(() => {
    const failure = SyncRetryService.getFailedSync(readingId);
    const status = SyncRetryService.getRetryStatus(readingId);
    setFailedSync(failure || null);
    setRetryStatus(status);
  }, [readingId]);

  const handleManualRetry = useCallback(async () => {
    setIsRetrying(true);
    setError(null);
    try {
      const successCount = await SyncRetryService.retryAllFailedSyncs();
      if (successCount > 0) {
        setFailedSync(null);
        onClose();
      } else {
        setError('Retry failed. Please check your connection and try again.');
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      );
    } finally {
      setIsRetrying(false);
      updateStatus();
    }
  }, [onClose]);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const formatNextRetry = (nextRetryAt: number | undefined): string => {
    if (!nextRetryAt) return 'No retry scheduled';
    const now = Date.now();
    const diff = nextRetryAt - now;
    if (diff <= 0) return 'Retrying now';
    const seconds = Math.ceil(diff / 1000);
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minutes`;
  };

  if (!failedSync) {
    return (
      <Modal visible={visible} transparent onRequestClose={onClose}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.title}>Sync Status</Text>
            <Text style={styles.successMessage}>
              ✓ All readings have been synchronized successfully!
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>Sync Retry Status</Text>

          {/* Failure Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Reading ID:</Text>
              <Text style={styles.value}>{failedSync.readingId}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Meter Code:</Text>
              <Text style={styles.value}>{failedSync.meterCode}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Value:</Text>
              <Text style={styles.value}>{failedSync.value} units</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Failure Reason:</Text>
              <Text style={[styles.value, styles.errorText]}>
                {failedSync.failureReason}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Attempts:</Text>
              <Text style={styles.value}>{retryStatus.attemptCount}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Last Failure:</Text>
              <Text style={styles.value}>
                {formatTime(failedSync.lastFailureAt)}
              </Text>
            </View>

            {retryStatus.isRetrying && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Next Retry:</Text>
                <Text style={styles.value}>
                  {formatNextRetry(retryStatus.nextRetryAt)}
                </Text>
              </View>
            )}
          </View>

          {/* Retry Status */}
          <View style={styles.statusContainer}>
            {retryStatus.isRetrying ? (
              <View style={styles.retryingStatus}>
                <ActivityIndicator color="#007AFF" />
                <Text style={styles.retryingText}>
                  Automatic retry scheduled...
                </Text>
              </View>
            ) : (
              <Text style={styles.failedText}>Sync failed</Text>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{error}</Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                isRetrying && styles.disabledButton,
              ]}
              onPress={handleManualRetry}
              disabled={isRetrying}
            >
              {isRetrying ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>Retry Now</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={onClose}
              disabled={isRetrying}
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  detailsContainer: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    flex: 1,
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  errorText: {
    color: '#E63946',
  },
  statusContainer: {
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  retryingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryingText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  failedText: {
    fontSize: 14,
    color: '#E63946',
    fontWeight: '500',
  },
  successMessage: {
    fontSize: 14,
    color: '#28A745',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  errorContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FFE0E0',
    borderRadius: 8,
  },
  errorMessage: {
    fontSize: 13,
    color: '#E63946',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
