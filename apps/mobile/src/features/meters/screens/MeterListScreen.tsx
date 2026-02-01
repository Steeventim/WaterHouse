/**
 * MeterListScreen - Liste des compteurs triée avec progression
 * Story 3.1: Liste des compteurs triée
 */

import React, { useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text } from 'react-native';
import { useMeters } from '../hooks/useMeters';
import { MeterWithContext } from '../services/MeterSortingService';
import { ProgressBar } from '../components/ProgressBar';

export const MeterListScreen: React.FC = () => {
  const [selectedBuilding, setSelectedBuilding] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<'all' | 'read' | 'unread'>('all');
  const [searchQuery] = useState('');

  const { meters, groupedMeters, loading, error, refresh, progress } = useMeters({
    buildingFilter: selectedBuilding,
    statusFilter,
    searchQuery,
  });

  const renderMeterItem = ({ item }: { item: MeterWithContext }) => (
    <TouchableOpacity style={styles.meterCard} onPress={() => handleMeterPress(item)}>
      <View style={styles.meterHeader}>
        <Text style={styles.buildingName}>{item.building.name}</Text>
        <Text style={styles.apartmentInfo}>
          Étage {item.apartment.floor ?? 0} - Apt {item.apartment.number}
        </Text>
      </View>

      <View style={styles.meterDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Compteur:</Text>
          <Text style={styles.value}>{item.meter.serialNumber}</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{getMeterTypeLabel(item.meter.type)}</Text>
        </View>

        {item.lastReading !== undefined && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Dernier index:</Text>
            <Text style={styles.valueHighlight}>{item.lastReading}</Text>
          </View>
        )}

        {item.lastReadingDate && (
          <View style={styles.detailRow}>
            <Text style={styles.label}>Date:</Text>
            <Text style={styles.dateText}>
              {formatDate(item.lastReadingDate)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.addressText}>{item.building.address}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderBuildingGroup = (buildingId: string) => {
    const group = groupedMeters.find(g => g.buildingId === buildingId);
    if (!group) return null;

    return (
      <View style={styles.buildingGroup}>
        <TouchableOpacity
          style={styles.buildingHeader}
          onPress={() => toggleBuilding(buildingId)}
        >
          <View style={styles.buildingHeaderContent}>
            <Text style={styles.buildingTitle}>{group.buildingName}</Text>
            <Text style={styles.buildingSubtitle}>{group.buildingAddress}</Text>
          </View>

          <View style={styles.buildingStats}>
            <Text style={styles.statsText}>
              {group.readMeters}/{group.totalMeters}
            </Text>
            <ProgressBar progress={group.progress} size="small" />
          </View>
        </TouchableOpacity>

        {selectedBuilding === buildingId && (
          <FlatList
            data={group.meters}
            renderItem={renderMeterItem}
            keyExtractor={item => item.meter.id}
            scrollEnabled={false}
          />
        )}
      </View>
    );
  };

  const toggleBuilding = (buildingId: string) => {
    setSelectedBuilding(prev => (prev === buildingId ? undefined : buildingId));
  };

  const handleMeterPress = (meter: MeterWithContext) => {
    // TODO: Navigation vers l'écran de saisie du relevé
    console.log('Meter pressed:', meter.meter.id);
  };

  if (loading && meters.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text>Chargement des compteurs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header avec progression globale */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Compteurs</Text>
        <View style={styles.globalProgress}>
          <Text style={styles.globalProgressText}>
            Progression: {progress}%
          </Text>
          <ProgressBar progress={progress} size="medium" />
        </View>
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('all')}
        >
          <Text style={styles.filterButtonText}>Tous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'unread' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('unread')}
        >
          <Text style={styles.filterButtonText}>À faire</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, statusFilter === 'read' && styles.filterButtonActive]}
          onPress={() => setStatusFilter('read')}
        >
          <Text style={styles.filterButtonText}>Terminés</Text>
        </TouchableOpacity>
      </View>

      {/* Liste des immeubles */}
      <FlatList
        data={groupedMeters}
        renderItem={({ item }) => renderBuildingGroup(item.buildingId)}
        keyExtractor={item => item.buildingId}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

// Helpers
const getMeterTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    water: 'Eau',
    electricity: 'Électricité',
    gas: 'Gaz',
  };
  return labels[type] || type;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  globalProgress: {
    marginTop: 8,
  },
  globalProgressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  filters: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  listContent: {
    padding: 12,
  },
  buildingGroup: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buildingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  buildingHeaderContent: {
    flex: 1,
  },
  buildingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  buildingSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  buildingStats: {
    alignItems: 'flex-end',
    marginLeft: 16,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 4,
  },
  meterCard: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    backgroundColor: '#fafafa',
  },
  meterHeader: {
    marginBottom: 12,
  },
  buildingName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  apartmentInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  meterDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  valueHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  addressText: {
    fontSize: 12,
    color: '#999',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#2196F3',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
