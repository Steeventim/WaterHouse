import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SyncStatusService, SyncQueueItem } from '../services/SyncStatusService';

interface SyncDashboardProps {
  onRetryFailed?: (items: SyncQueueItem[]) => Promise<void>;
  refreshInterval?: number;
}

export const SyncDashboard: React.FC<SyncDashboardProps> = ({
  onRetryFailed,
  refreshInterval = 2000,
}) => {
  const [stats, setStats] = useState(SyncStatusService.getStats());
  const [progress, setProgress] = useState(SyncStatusService.getProgress());
  const [queue, setQueue] = useState(SyncStatusService.getQueue());
  const [history, setHistory] = useState(SyncStatusService.getHistory(20));
  const [activeTab, setActiveTab] = useState<'overview' | 'queue' | 'history'>('overview');
  const [isRetrying, setIsRetrying] = useState(false);

  // Auto-refresh stats
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(SyncStatusService.getStats());
      setProgress(SyncStatusService.getProgress());
      setQueue(SyncStatusService.getQueue());
      setHistory(SyncStatusService.getHistory(20));
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const handleRetryFailed = useCallback(async () => {
    if (!onRetryFailed) return;

    const failedItems = SyncStatusService.getFailedItems();
    if (failedItems.length === 0) return;

    setIsRetrying(true);
    try {
      await onRetryFailed(failedItems);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetryFailed]);

  const handleClearCompleted = useCallback(() => {
    SyncStatusService.clearCompletedItems();
    setQueue(SyncStatusService.getQueue());
  }, []);

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    return date.toLocaleDateString();
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success':
        return '#28A745';
      case 'failed':
        return '#E63946';
      case 'syncing':
        return '#007AFF';
      case 'pending':
        return '#FFA500';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'queue' && styles.activeTab]}
          onPress={() => setActiveTab('queue')}
        >
          <Text style={[styles.tabText, activeTab === 'queue' && styles.activeTabText]}>
            Queue ({queue.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {activeTab === 'overview' && (
          <View>
            {/* Progress */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sync Progress</Text>

              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%` },
                  ]}
                />
              </View>

              <Text style={styles.progressText}>
                {Math.round(progress)}% Complete
              </Text>
            </View>

            {/* Statistics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Statistics</Text>

              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.totalItems}</Text>
                  <Text style={styles.statLabel}>Total Items</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: getStatusColor('syncing') }]}>
                    {stats.syncingItems}
                  </Text>
                  <Text style={styles.statLabel}>Syncing</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: getStatusColor('pending') }]}>
                    {stats.pendingItems}
                  </Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: getStatusColor('success') }]}>
                    {stats.successfulItems}
                  </Text>
                  <Text style={styles.statLabel}>Success</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={[styles.statValue, { color: getStatusColor('failed') }]}>
                    {stats.failedItems}
                  </Text>
                  <Text style={styles.statLabel}>Failed</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {stats.successRate.toFixed(1)}%
                  </Text>
                  <Text style={styles.statLabel}>Success Rate</Text>
                </View>
              </View>
            </View>

            {/* Timing Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Timing</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Average Sync Time:</Text>
                <Text style={styles.infoValue}>
                  {formatDuration(stats.averageSyncTime)}
                </Text>
              </View>

              {stats.lastSyncAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Last Sync:</Text>
                  <Text style={styles.infoValue}>{formatTime(stats.lastSyncAt)}</Text>
                </View>
              )}

              {stats.nextSyncAt && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Next Sync:</Text>
                  <Text style={styles.infoValue}>{formatTime(stats.nextSyncAt)}</Text>
                </View>
              )}
            </View>

            {/* Actions */}
            {stats.failedItems > 0 && (
              <View style={styles.section}>
                <TouchableOpacity
                  style={[styles.button, isRetrying && styles.disabledButton]}
                  onPress={handleRetryFailed}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Retry Failed Items</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'queue' && (
          <View style={styles.section}>
            <View style={styles.queueHeader}>
              <Text style={styles.sectionTitle}>Sync Queue</Text>
              {queue.length > 0 && stats.failedItems === 0 && stats.syncingItems === 0 && (
                <TouchableOpacity onPress={handleClearCompleted}>
                  <Text style={styles.clearLink}>Clear Completed</Text>
                </TouchableOpacity>
              )}
            </View>

            {queue.length === 0 ? (
              <Text style={styles.emptyText}>Queue is empty</Text>
            ) : (
              <FlatList
                data={queue}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.queueItem}>
                    <View style={styles.queueItemHeader}>
                      <Text style={styles.queueItemTitle}>{item.meterCode}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(item.status) },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{item.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.queueItemValue}>Reading: {item.readingId}</Text>

                    {item.error && (
                      <Text style={styles.queueItemError}>{item.error}</Text>
                    )}

                    <View style={styles.queueItemFooter}>
                      <Text style={styles.queueItemMeta}>
                        {formatTime(item.timestamp)} • Retry: {item.retryCount}
                      </Text>
                    </View>
                  </View>
                )}
              />
            )}
          </View>
        )}

        {activeTab === 'history' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sync History</Text>

            {history.length === 0 ? (
              <Text style={styles.emptyText}>No history available</Text>
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <View style={styles.historyItemHeader}>
                      <Text style={styles.historyItemTitle}>{item.meterCode}</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(item.status) },
                        ]}
                      >
                        <Text style={styles.statusBadgeText}>{item.status}</Text>
                      </View>
                    </View>

                    <Text style={styles.historyItemValue}>Reading: {item.readingId}</Text>

                    <View style={styles.historyItemFooter}>
                      <Text style={styles.historyItemMeta}>
                        {formatTime(item.timestamp)} • Duration: {formatDuration(item.duration)}
                      </Text>
                    </View>

                    {item.error && (
                      <Text style={styles.historyItemError}>{item.error}</Text>
                    )}
                  </View>
                )}
              />
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#28A745',
  },
  progressText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '48%',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 13,
    color: '#666',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearLink: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingVertical: 20,
  },
  queueItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  queueItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  queueItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  queueItemValue: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  queueItemError: {
    fontSize: 12,
    color: '#E63946',
    marginTop: 4,
    fontStyle: 'italic',
  },
  queueItemFooter: {
    marginTop: 8,
  },
  queueItemMeta: {
    fontSize: 12,
    color: '#999',
  },
  historyItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  historyItemValue: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  historyItemFooter: {
    marginTop: 8,
  },
  historyItemMeta: {
    fontSize: 12,
    color: '#999',
  },
  historyItemError: {
    fontSize: 12,
    color: '#E63946',
    marginTop: 4,
    fontStyle: 'italic',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
