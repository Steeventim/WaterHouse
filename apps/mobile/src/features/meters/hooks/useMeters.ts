/**
 * Hook for retrieving and managing sorted meters with local storage
 */

import { useState, useEffect, useCallback } from 'react';
import { LocalStorage } from '../../catalog/services/LocalStorage';
import { MeterSortingService, MeterWithContext, GroupedMeters } from '../services/MeterSortingService';
import { Building, Apartment, Meter } from '../../../common/types/sync.types';

export interface UseMetersOptions {
  buildingFilter?: string;
  statusFilter?: 'all' | 'read' | 'unread';
  searchQuery?: string;
}

export interface UseMetersResult {
  meters: MeterWithContext[];
  groupedMeters: GroupedMeters[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  totalMeters: number;
  readMeters: number;
  progress: number;
}

export const useMeters = (options: UseMetersOptions = {}): UseMetersResult => {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [readMeterIds, setReadMeterIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const localStorage = new LocalStorage();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await localStorage.initialize();

      // Charger toutes les données en parallèle
      const [metersData, apartmentsData, buildingsData] = await Promise.all([
        localStorage.getAllMeters(),
        localStorage.getAllApartments(),
        localStorage.getAllBuildings(),
      ]);

      setMeters(metersData);
      setApartments(apartmentsData);
      setBuildings(buildingsData);

      // TODO: Charger les IDs des meters déjà lus depuis une table readings
      // Pour l'instant, considérer les meters avec currentReading comme lus
      const readIds = new Set<string>(
        metersData
          .filter(m => m.currentReading !== undefined && m.currentReading > m.initialReading)
          .map(m => m.id)
      );
      setReadMeterIds(readIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load meters');
      console.error('Error loading meters:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Enrichir et trier les meters
  const enrichedMeters = MeterSortingService.enrichMetersWithContext(
    meters,
    apartments,
    buildings
  );

  let filteredMeters = MeterSortingService.sortMetersHierarchically(enrichedMeters);

  // Appliquer les filtres
  if (options.buildingFilter) {
    filteredMeters = MeterSortingService.filterByBuilding(
      filteredMeters,
      options.buildingFilter
    );
  }

  if (options.statusFilter && options.statusFilter !== 'all') {
    filteredMeters = MeterSortingService.filterByReadStatus(
      filteredMeters,
      readMeterIds,
      options.statusFilter
    );
  }

  if (options.searchQuery) {
    filteredMeters = MeterSortingService.searchMeters(
      filteredMeters,
      options.searchQuery
    );
  }

  // Grouper par immeuble
  const groupedMeters = MeterSortingService.groupMetersByBuilding(
    filteredMeters,
    readMeterIds
  );

  // Calculer la progression globale
  const totalMeters = filteredMeters.length;
  const readMetersCount = filteredMeters.filter(m => readMeterIds.has(m.meter.id)).length;
  const progress = totalMeters > 0 ? Math.round((readMetersCount / totalMeters) * 100) : 0;

  return {
    meters: filteredMeters,
    groupedMeters,
    loading,
    error,
    refresh: loadData,
    totalMeters,
    readMeters: readMetersCount,
    progress,
  };
};
