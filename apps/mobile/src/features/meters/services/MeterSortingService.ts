/**
 * Service for sorting and organizing meters hierarchically
 * Sorts by building → floor → apartment number
 */

import { Building, Apartment, Meter } from '../../../common/types/sync.types';

export interface MeterWithContext {
  meter: Meter;
  apartment: Apartment;
  building: Building;
  hasReading?: boolean;
  lastReading?: number;
  lastReadingDate?: string;
}

export interface GroupedMeters {
  buildingId: string;
  buildingName: string;
  buildingAddress: string;
  meters: MeterWithContext[];
  totalMeters: number;
  readMeters: number;
  progress: number; // 0-100
}

export class MeterSortingService {
  /**
   * Enrichit les meters avec leur contexte (apartment, building)
   */
  static enrichMetersWithContext(
    meters: Meter[],
    apartments: Apartment[],
    buildings: Building[]
  ): MeterWithContext[] {
    const apartmentMap = new Map(apartments.map(apt => [apt.id, apt]));
    const buildingMap = new Map(buildings.map(bld => [bld.id, bld]));

    return meters
      .map(meter => {
        const apartment = apartmentMap.get(meter.apartmentId);
        if (!apartment) return null;

        const building = buildingMap.get(apartment.buildingId);
        if (!building) return null;

        const enriched: MeterWithContext = {
          meter,
          apartment,
          building,
        };

        if (meter.currentReading !== undefined) {
          enriched.lastReading = meter.currentReading;
        }
        if (meter.lastReadingDate) {
          enriched.lastReadingDate = meter.lastReadingDate;
        }

        return enriched;
      })
      .filter((item): item is MeterWithContext => item !== null);
  }

  /**
   * Tri hiérarchique : building name → floor → apartment number
   */
  static sortMetersHierarchically(enrichedMeters: MeterWithContext[]): MeterWithContext[] {
    return [...enrichedMeters].sort((a, b) => {
      // 1. Par nom d'immeuble
      const buildingCompare = a.building.name.localeCompare(b.building.name);
      if (buildingCompare !== 0) return buildingCompare;

      // 2. Par étage
      const floorA = a.apartment.floor ?? 0;
      const floorB = b.apartment.floor ?? 0;
      if (floorA !== floorB) return floorA - floorB;

      // 3. Par numéro d'appartement
      return a.apartment.number.localeCompare(b.apartment.number, undefined, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }

  /**
   * Groupe les meters par immeuble avec calcul de progression
   */
  static groupMetersByBuilding(
    enrichedMeters: MeterWithContext[],
    readMeterIds?: Set<string>
  ): GroupedMeters[] {
    const grouped = new Map<string, MeterWithContext[]>();

    enrichedMeters.forEach(item => {
      const buildingId = item.building.id;
      if (!grouped.has(buildingId)) {
        grouped.set(buildingId, []);
      }
      const group = grouped.get(buildingId);
      if (group) {
        group.push(item);
      }
    });

    return Array.from(grouped.entries()).map(([buildingId, meters]) => {
      const building = meters[0].building;
      const totalMeters = meters.length;
      const readMeters = readMeterIds
        ? meters.filter(m => readMeterIds.has(m.meter.id)).length
        : 0;
      const progress = totalMeters > 0 ? Math.round((readMeters / totalMeters) * 100) : 0;

      return {
        buildingId,
        buildingName: building.name,
        buildingAddress: building.address,
        meters,
        totalMeters,
        readMeters,
        progress,
      };
    }).sort((a, b) => a.buildingName.localeCompare(b.buildingName));
  }

  /**
   * Filtre les meters par immeuble
   */
  static filterByBuilding(
    enrichedMeters: MeterWithContext[],
    buildingId: string
  ): MeterWithContext[] {
    return enrichedMeters.filter(item => item.building.id === buildingId);
  }

  /**
   * Filtre les meters par statut de lecture
   */
  static filterByReadStatus(
    enrichedMeters: MeterWithContext[],
    readMeterIds: Set<string>,
    status: 'read' | 'unread' | 'all'
  ): MeterWithContext[] {
    if (status === 'all') return enrichedMeters;

    return enrichedMeters.filter(item => {
      const isRead = readMeterIds.has(item.meter.id);
      return status === 'read' ? isRead : !isRead;
    });
  }

  /**
   * Recherche full-text dans les meters
   */
  static searchMeters(
    enrichedMeters: MeterWithContext[],
    query: string
  ): MeterWithContext[] {
    if (!query.trim()) return enrichedMeters;

    const lowerQuery = query.toLowerCase();
    return enrichedMeters.filter(item =>
      item.building.name.toLowerCase().includes(lowerQuery) ||
      item.building.address.toLowerCase().includes(lowerQuery) ||
      item.apartment.number.toLowerCase().includes(lowerQuery) ||
      item.meter.serialNumber.toLowerCase().includes(lowerQuery)
    );
  }
}
