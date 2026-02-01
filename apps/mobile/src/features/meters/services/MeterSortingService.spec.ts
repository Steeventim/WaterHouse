/**
 * Tests for MeterSortingService
 */

import { MeterSortingService } from '../services/MeterSortingService';
import { Building, Apartment, Meter } from '../../../common/types/sync.types';

describe('MeterSortingService', () => {
  const mockBuildings: Building[] = [
    {
      id: 'b1',
      name: 'Immeuble A',
      address: '123 Rue Test',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'b2',
      name: 'Immeuble B',
      address: '456 Avenue Test',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockApartments: Apartment[] = [
    {
      id: 'a1',
      buildingId: 'b1',
      number: '101',
      floor: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'a2',
      buildingId: 'b1',
      number: '201',
      floor: 2,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
    {
      id: 'a3',
      buildingId: 'b2',
      number: '102',
      floor: 1,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  const mockMeters: Meter[] = [
    {
      id: 'm1',
      apartmentId: 'a1',
      type: 'water',
      serialNumber: 'WTR-001',
      initialReading: 100,
      currentReading: 150,
      lastReadingDate: '2024-01-15',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    {
      id: 'm2',
      apartmentId: 'a2',
      type: 'water',
      serialNumber: 'WTR-002',
      initialReading: 200,
      currentReading: 220,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-15',
    },
    {
      id: 'm3',
      apartmentId: 'a3',
      type: 'electricity',
      serialNumber: 'ELC-001',
      initialReading: 500,
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    },
  ];

  describe('enrichMetersWithContext', () => {
    it('should enrich meters with apartment and building context', () => {
      const result = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      expect(result).toHaveLength(3);
      expect(result[0]).toMatchObject({
        meter: expect.objectContaining({ id: 'm1' }),
        apartment: expect.objectContaining({ id: 'a1' }),
        building: expect.objectContaining({ id: 'b1' }),
      });
    });

    it('should filter out meters without apartment or building', () => {
      const orphanMeter: Meter = {
        ...mockMeters[0],
        id: 'm-orphan',
        apartmentId: 'nonexistent',
      };

      const result = MeterSortingService.enrichMetersWithContext(
        [...mockMeters, orphanMeter],
        mockApartments,
        mockBuildings
      );

      expect(result).toHaveLength(3);
      expect(result.find(m => m.meter.id === 'm-orphan')).toBeUndefined();
    });
  });

  describe('sortMetersHierarchically', () => {
    it('should sort by building name, then floor, then apartment number', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const sorted = MeterSortingService.sortMetersHierarchically(enriched);

      // Immeuble A < Immeuble B
      expect(sorted[0].building.name).toBe('Immeuble A');
      expect(sorted[1].building.name).toBe('Immeuble A');
      expect(sorted[2].building.name).toBe('Immeuble B');

      // Within Immeuble A: floor 1 < floor 2
      expect(sorted[0].apartment.floor).toBe(1);
      expect(sorted[1].apartment.floor).toBe(2);
    });

    it('should handle numeric apartment sorting correctly', () => {
      const apartments: Apartment[] = [
        { ...mockApartments[0], id: 'a1', number: '2', buildingId: 'b1', floor: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { ...mockApartments[0], id: 'a2', number: '10', buildingId: 'b1', floor: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { ...mockApartments[0], id: 'a3', number: '3', buildingId: 'b1', floor: 1, createdAt: '2024-01-01', updatedAt: '2024-01-01' },
      ];

      const meters: Meter[] = apartments.map((apt, i) => ({
        ...mockMeters[0],
        id: `m${i}`,
        apartmentId: apt.id,
      }));

      const enriched = MeterSortingService.enrichMetersWithContext(
        meters,
        apartments,
        [mockBuildings[0]]
      );

      const sorted = MeterSortingService.sortMetersHierarchically(enriched);

      expect(sorted[0].apartment.number).toBe('2');
      expect(sorted[1].apartment.number).toBe('3');
      expect(sorted[2].apartment.number).toBe('10');
    });
  });

  describe('groupMetersByBuilding', () => {
    it('should group meters by building with progress calculation', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const readMeterIds = new Set(['m1']);
      const grouped = MeterSortingService.groupMetersByBuilding(enriched, readMeterIds);

      expect(grouped).toHaveLength(2);

      const building1 = grouped.find(g => g.buildingId === 'b1');
      expect(building1).toBeDefined();
      expect(building1?.totalMeters).toBe(2);
      expect(building1?.readMeters).toBe(1);
      expect(building1?.progress).toBe(50);
    });

    it('should calculate 0% progress when no meters are read', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const grouped = MeterSortingService.groupMetersByBuilding(enriched, new Set());

      grouped.forEach(group => {
        expect(group.progress).toBe(0);
        expect(group.readMeters).toBe(0);
      });
    });

    it('should calculate 100% progress when all meters are read', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const allMeterIds = new Set(mockMeters.map(m => m.id));
      const grouped = MeterSortingService.groupMetersByBuilding(enriched, allMeterIds);

      grouped.forEach(group => {
        expect(group.progress).toBe(100);
        expect(group.readMeters).toBe(group.totalMeters);
      });
    });
  });

  describe('filterByBuilding', () => {
    it('should filter meters by building ID', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const filtered = MeterSortingService.filterByBuilding(enriched, 'b1');

      expect(filtered).toHaveLength(2);
      filtered.forEach(item => {
        expect(item.building.id).toBe('b1');
      });
    });
  });

  describe('filterByReadStatus', () => {
    const readMeterIds = new Set(['m1', 'm2']);

    it('should filter for read meters only', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const filtered = MeterSortingService.filterByReadStatus(
        enriched,
        readMeterIds,
        'read'
      );

      expect(filtered).toHaveLength(2);
      filtered.forEach(item => {
        expect(readMeterIds.has(item.meter.id)).toBe(true);
      });
    });

    it('should filter for unread meters only', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const filtered = MeterSortingService.filterByReadStatus(
        enriched,
        readMeterIds,
        'unread'
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].meter.id).toBe('m3');
    });

    it('should return all meters when status is "all"', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const filtered = MeterSortingService.filterByReadStatus(
        enriched,
        readMeterIds,
        'all'
      );

      expect(filtered).toHaveLength(3);
    });
  });

  describe('searchMeters', () => {
    it('should search meters by building name', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const result = MeterSortingService.searchMeters(enriched, 'Immeuble A');

      expect(result).toHaveLength(2);
      result.forEach(item => {
        expect(item.building.name).toContain('Immeuble A');
      });
    });

    it('should search meters by serial number', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const result = MeterSortingService.searchMeters(enriched, 'WTR-001');

      expect(result).toHaveLength(1);
      expect(result[0].meter.serialNumber).toBe('WTR-001');
    });

    it('should search meters by apartment number', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const result = MeterSortingService.searchMeters(enriched, '201');

      expect(result).toHaveLength(1);
      expect(result[0].apartment.number).toBe('201');
    });

    it('should be case-insensitive', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const result = MeterSortingService.searchMeters(enriched, 'immeuble a');

      expect(result).toHaveLength(2);
    });

    it('should return all meters when query is empty', () => {
      const enriched = MeterSortingService.enrichMetersWithContext(
        mockMeters,
        mockApartments,
        mockBuildings
      );

      const result = MeterSortingService.searchMeters(enriched, '');

      expect(result).toHaveLength(3);
    });
  });
});
