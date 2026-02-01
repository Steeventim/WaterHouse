/**
 * SyncNotificationManager - Displays sync progress notifications
 * Story 4.1: Synchronisation automatique en ligne
 * Shows toast notifications for sync events
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { BackgroundSyncService, SyncNotification } from '../services/BackgroundSyncService';

export interface SyncNotificationToastProps {
  duration?: number; // ms
}

const SyncNotificationToast: React.FC<SyncNotificationToastProps> = ({
  duration = 3000,
}) => {
  const [notification, setNotification] = useState<SyncNotification | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const unsubscribe = BackgroundSyncService.onSyncNotification((notif) => {
      setNotification(notif);
      showToast();
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [notification, duration]);

  const showToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setNotification(null);
    });
  };

  if (!notification) {
    return null;
  }

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return '#4caf50';
      case 'error':
        return '#f44336';
      case 'progress':
        return '#2196F3';
      default:
        return '#757575';
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'progress':
        return '↻';
      default:
        return 'ℹ';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-100, 0],
              }),
            },
          ],
        },
      ]}
    >
      <Text style={styles.icon}>{getIcon()}</Text>
      <View style={styles.content}>
        <Text style={styles.message}>{notification.message}</Text>
        {notification.progress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (notification.progress.synced / notification.progress.total) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>
              {notification.progress.synced}/{notification.progress.total}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  icon: {
    fontSize: 24,
    color: '#fff',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  message: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default SyncNotificationToast;
