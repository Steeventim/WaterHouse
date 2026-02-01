/**
 * ProgressBar component - Visual progress indicator
 */

import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'medium',
  showLabel = false,
  color,
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const barColor = color || getProgressColor(clampedProgress);

  const height = {
    small: 4,
    medium: 8,
    large: 12,
  }[size];

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedProgress}%`,
              height,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, { fontSize: size === 'small' ? 10 : 12 }]}>
          {clampedProgress}%
        </Text>
      )}
    </View>
  );
};

const getProgressColor = (progress: number): string => {
  if (progress < 30) return '#f44336'; // Red
  if (progress < 70) return '#ff9800'; // Orange
  return '#4caf50'; // Green
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 999,
  },
  label: {
    fontWeight: '600',
    color: '#666',
    minWidth: 35,
    textAlign: 'right',
  },
});
