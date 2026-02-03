import { ConsumptionCalculationService, TariffConfiguration } from '../services/ConsumptionCalculationService';

describe('ConsumptionCalculationService', () => {
  beforeEach(() => {
    ConsumptionCalculationService.clear();
  });

  // Meter Reading Tests
  describe('recordMeterReading', () => {
    it('should record a meter reading with all required fields', () => {
      const reading = ConsumptionCalculationService.recordMeterReading(
        'building-1',
        'METER-001',
        1250,
        'Regular monthly reading'
      );

      expect(reading).toBeDefined();
      expect(reading.buildingId).toBe('building-1');
      expect(reading.meterCode).toBe('METER-001');
      expect(reading.index).toBe(1250);
      expect(reading.notes).toBe('Regular monthly reading');
      expect(reading.timestamp).toBeGreaterThan(0);
    });

    it('should generate unique IDs for readings', () => {
      const reading1 = ConsumptionCalculationService.recordMeterReading(
        'building-1',
        'METER-001',
        1250
      );
      const reading2 = ConsumptionCalculationService.recordMeterReading(
        'building-1',
        'METER-001',
        1300
      );

      expect(reading1.id).not.toBe(reading2.id);
    });

    it('should record readings with optional notes', () => {
      const readingWithNotes = ConsumptionCalculationService.recordMeterReading(
        'building-1',
        'METER-001',
        1250,
        'Scheduled maintenance'
      );

      const readingWithoutNotes = ConsumptionCalculationService.recordMeterReading(
        'building-1',
        'METER-002',
        500
      );

      expect(readingWithNotes.notes).toBe('Scheduled maintenance');
      expect(readingWithoutNotes.notes).toBe('');
    });
  });

  // Get Meter Reading Tests
  describe('getMeterReading', () => {
    it('should retrieve a recorded meter reading by ID', () => {
      const recorded = ConsumptionCalculationService.recordMeterReading(
        'building-1',
        'METER-001',
        1250
      );

      const retrieved = ConsumptionCalculationService.getMeterReading(recorded.id);

      expect(retrieved).toEqual(recorded);
    });

    it('should return undefined for non-existent reading', () => {
      const retrieved = ConsumptionCalculationService.getMeterReading('non-existent-id');

      expect(retrieved).toBeUndefined();
    });
  });

  // Get Readings for Meter Tests
  describe('getReadingsForMeter', () => {
    it('should retrieve all readings for a specific meter', () => {
      ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1100);
      ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1200);
      ConsumptionCalculationService.recordMeterReading('building-1', 'METER-002', 500);

      const readings = ConsumptionCalculationService.getReadingsForMeter('building-1', 'METER-001');

      expect(readings).toHaveLength(3);
      expect(readings.every((r) => r.meterCode === 'METER-001')).toBe(true);
    });

    it('should return readings in chronological order', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1100);
      const r3 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1200);

      const readings = ConsumptionCalculationService.getReadingsForMeter('building-1', 'METER-001');

      expect(readings[0].index).toBe(1000);
      expect(readings[1].index).toBe(1100);
      expect(readings[2].index).toBe(1200);
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000 + i * 10);
      }

      const readings = ConsumptionCalculationService.getReadingsForMeter('building-1', 'METER-001', 5);

      expect(readings).toHaveLength(5);
    });

    it('should return empty array for non-existent meter', () => {
      const readings = ConsumptionCalculationService.getReadingsForMeter(
        'building-1',
        'NON-EXISTENT'
      );

      expect(readings).toEqual([]);
    });
  });

  // Get Previous Reading Tests
  describe('getPreviousReading', () => {
    it('should find the previous reading before timestamp', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1100);
      const r3 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1200);

      const previous = ConsumptionCalculationService.getPreviousReading(
        'building-1',
        'METER-001',
        r3.timestamp
      );

      expect(previous?.id).toBe(r2.id);
      expect(previous?.index).toBe(1100);
    });

    it('should return undefined when no previous reading exists', () => {
      ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);

      const previous = ConsumptionCalculationService.getPreviousReading(
        'building-1',
        'METER-001',
        Date.now() + 1000
      );

      expect(previous).toBeUndefined();
    });

    it('should not return reading at or after the timestamp', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1100);

      const previous = ConsumptionCalculationService.getPreviousReading(
        'building-1',
        'METER-001',
        r2.timestamp
      );

      expect(previous?.id).toBe(r1.id);
    });
  });

  // Basic Consumption Calculation Tests
  describe('calculateConsumption', () => {
    it('should calculate simple consumption between two readings', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1250);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const calculation = ConsumptionCalculationService.calculateConsumption(
        r2.id,
        r1.id,
        undefined,
        undefined,
        tariff
      );

      expect(calculation).toBeDefined();
      expect(calculation?.calculation.consumption).toBe(250);
      expect(calculation?.calculation.baseCost).toBe(625); // 250 * 2.5
      expect(calculation?.calculation.taxAmount).toBe(125); // 625 * 0.2
      expect(calculation?.calculation.totalCost).toBe(750); // 625 + 125
    });

    it('should auto-find previous reading when not provided', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1250);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const calculation = ConsumptionCalculationService.calculateConsumption(
        r2.id,
        undefined,
        undefined,
        undefined,
        tariff
      );

      expect(calculation).toBeDefined();
      expect(calculation?.calculation.consumption).toBe(250);
    });

    it('should return null when reading not found', () => {
      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const calculation = ConsumptionCalculationService.calculateConsumption(
        'non-existent',
        undefined,
        undefined,
        undefined,
        tariff
      );

      expect(calculation).toBeNull();
    });

    it('should include billing period when provided', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1250);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const periodStart = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const periodEnd = Date.now();

      const calculation = ConsumptionCalculationService.calculateConsumption(
        r2.id,
        r1.id,
        periodStart,
        periodEnd,
        tariff
      );

      expect(calculation?.calculation.billingPeriodStart).toBe(periodStart);
      expect(calculation?.calculation.billingPeriodEnd).toBe(periodEnd);
    });
  });

  // Meter Reset Handling Tests
  describe('handleMeterReset', () => {
    it('should detect and handle meter reset', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 9999);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 100); // Meter reset

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const calculation = ConsumptionCalculationService.handleMeterReset(r2, r1, tariff);

      expect(calculation).toBeDefined();
      expect(calculation.consumption).toBeGreaterThanOrEqual(0);
    });

    it('should calculate correct consumption after meter reset', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 9950);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 50); // Meter wraps at 10000

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 1.0,
        currency: 'EUR',
        taxPercentage: 0,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const calculation = ConsumptionCalculationService.handleMeterReset(r2, r1, tariff);

      // Consumption should be: (10000 - 9950) + 50 = 100
      expect(calculation.consumption).toBe(100);
    });
  });

  // Progressive/Tiered Rates Tests
  describe('buildTierBreakdown', () => {
    it('should build tier breakdown for progressive rates', () => {
      const tierRates = [
        { min: 0, max: 100, rate: 1.0 },
        { min: 100, max: 300, rate: 2.0 },
        { min: 300, max: Infinity, rate: 3.0 },
      ];

      const breakdown = ConsumptionCalculationService.buildTierBreakdown(0, 350, tierRates);

      expect(breakdown).toHaveLength(3);
      expect(breakdown[0].tierConsumption).toBe(100);
      expect(breakdown[0].ratePerUnit).toBe(1.0);
      expect(breakdown[1].tierConsumption).toBe(200);
      expect(breakdown[1].ratePerUnit).toBe(2.0);
      expect(breakdown[2].tierConsumption).toBe(50);
      expect(breakdown[2].ratePerUnit).toBe(3.0);
    });

    it('should calculate correct costs for each tier', () => {
      const tierRates = [
        { min: 0, max: 100, rate: 1.0 },
        { min: 100, max: 300, rate: 2.0 },
        { min: 300, max: Infinity, rate: 3.0 },
      ];

      const breakdown = ConsumptionCalculationService.buildTierBreakdown(0, 350, tierRates);

      expect(breakdown[0].tierCost).toBe(100); // 100 * 1.0
      expect(breakdown[1].tierCost).toBe(400); // 200 * 2.0
      expect(breakdown[2].tierCost).toBe(150); // 50 * 3.0
    });

    it('should handle consumption within single tier', () => {
      const tierRates = [
        { min: 0, max: 100, rate: 1.0 },
        { min: 100, max: 300, rate: 2.0 },
        { min: 300, max: Infinity, rate: 3.0 },
      ];

      const breakdown = ConsumptionCalculationService.buildTierBreakdown(0, 50, tierRates);

      expect(breakdown).toHaveLength(1);
      expect(breakdown[0].tierConsumption).toBe(50);
      expect(breakdown[0].tierCost).toBe(50);
    });
  });

  // Calculation Query Tests
  describe('getCalculation', () => {
    it('should retrieve a calculated consumption by ID', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1250);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const calculated = ConsumptionCalculationService.calculateConsumption(
        r2.id,
        r1.id,
        undefined,
        undefined,
        tariff
      );

      const retrieved = ConsumptionCalculationService.getCalculation(
        calculated!.calculation.id
      );

      expect(retrieved).toEqual(calculated?.calculation);
    });

    it('should return undefined for non-existent calculation', () => {
      const retrieved = ConsumptionCalculationService.getCalculation('non-existent-id');

      expect(retrieved).toBeUndefined();
    });
  });

  // Building-Level Aggregation Tests
  describe('getCalculationsByBuilding', () => {
    it('should retrieve all calculations for a building', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1250);
      const r3 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-002', 500);
      const r4 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-002', 750);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      ConsumptionCalculationService.calculateConsumption(r2.id, r1.id, undefined, undefined, tariff);
      ConsumptionCalculationService.calculateConsumption(r4.id, r3.id, undefined, undefined, tariff);

      const calculations = ConsumptionCalculationService.getCalculationsByBuilding('building-1');

      expect(calculations).toHaveLength(2);
    });

    it('should respect limit parameter', () => {
      for (let i = 0; i < 10; i++) {
        const r1 = ConsumptionCalculationService.recordMeterReading(
          'building-1',
          'METER-001',
          1000 + i * 100
        );
        const r2 = ConsumptionCalculationService.recordMeterReading(
          'building-1',
          'METER-001',
          1000 + (i + 1) * 100
        );

        const tariff: TariffConfiguration = {
          id: 'tariff-1',
          buildingId: 'building-1',
          name: 'Standard Tariff',
          type: 'fixed',
          baseRate: 2.5,
          currency: 'EUR',
          taxPercentage: 20,
          isActive: true,
          createdAt: 0,
          updatedAt: 0,
        };

        ConsumptionCalculationService.calculateConsumption(
          r2.id,
          r1.id,
          undefined,
          undefined,
          tariff
        );
      }

      const calculations = ConsumptionCalculationService.getCalculationsByBuilding(
        'building-1',
        5
      );

      expect(calculations).toHaveLength(5);
    });
  });

  // Meter-Level Aggregation Tests
  describe('getCalculationsByMeter', () => {
    it('should retrieve calculations for specific meter', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1250);
      const r3 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-002', 500);
      const r4 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-002', 750);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      ConsumptionCalculationService.calculateConsumption(r2.id, r1.id, undefined, undefined, tariff);
      ConsumptionCalculationService.calculateConsumption(r4.id, r3.id, undefined, undefined, tariff);

      const meter1Calcs = ConsumptionCalculationService.getCalculationsByMeter(
        'building-1',
        'METER-001'
      );
      const meter2Calcs = ConsumptionCalculationService.getCalculationsByMeter(
        'building-1',
        'METER-002'
      );

      expect(meter1Calcs).toHaveLength(1);
      expect(meter2Calcs).toHaveLength(1);
      expect(meter1Calcs[0].meterCode).toBe('METER-001');
      expect(meter2Calcs[0].meterCode).toBe('METER-002');
    });
  });

  // Billing Period Queries Tests
  describe('getCalculationsByBillingPeriod', () => {
    it('should retrieve calculations within billing period', () => {
      const periodStart = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const periodEnd = Date.now();

      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1250);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      ConsumptionCalculationService.calculateConsumption(
        r2.id,
        r1.id,
        periodStart,
        periodEnd,
        tariff
      );

      const calculations = ConsumptionCalculationService.getCalculationsByBillingPeriod(
        'building-1',
        periodStart,
        periodEnd
      );

      expect(calculations).toHaveLength(1);
    });

    it('should exclude calculations outside period', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1250);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const periodStart = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const periodEnd = Date.now();

      ConsumptionCalculationService.calculateConsumption(
        r2.id,
        r1.id,
        periodStart,
        periodEnd,
        tariff
      );

      const wrongPeriodStart = Date.now() + 24 * 60 * 60 * 1000;
      const wrongPeriodEnd = Date.now() + 60 * 24 * 60 * 60 * 1000;

      const calculations = ConsumptionCalculationService.getCalculationsByBillingPeriod(
        'building-1',
        wrongPeriodStart,
        wrongPeriodEnd
      );

      expect(calculations).toHaveLength(0);
    });
  });

  // Summary Tests
  describe('getCalculationSummary', () => {
    it('should calculate building summary correctly', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1250);
      const r3 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-002', 500);
      const r4 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-002', 750);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      ConsumptionCalculationService.calculateConsumption(r2.id, r1.id, undefined, undefined, tariff);
      ConsumptionCalculationService.calculateConsumption(r4.id, r3.id, undefined, undefined, tariff);

      const summary = ConsumptionCalculationService.getCalculationSummary('building-1');

      expect(summary.totalConsumption).toBe(500); // 250 + 250
      expect(summary.calculationCount).toBe(2);
      expect(summary.totalBaseCost).toBeGreaterThan(0);
      expect(summary.totalTaxAmount).toBeGreaterThan(0);
      expect(summary.totalCost).toBeGreaterThan(0);
    });

    it('should return zero values for building with no calculations', () => {
      const summary = ConsumptionCalculationService.getCalculationSummary('building-1');

      expect(summary.totalConsumption).toBe(0);
      expect(summary.calculationCount).toBe(0);
      expect(summary.totalBaseCost).toBe(0);
      expect(summary.totalTaxAmount).toBe(0);
      expect(summary.totalCost).toBe(0);
    });
  });

  // Validation Tests
  describe('validateCalculation', () => {
    it('should validate correct calculation', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1250);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const calculation = ConsumptionCalculationService.calculateConsumption(
        r2.id,
        r1.id,
        undefined,
        undefined,
        tariff
      );

      const errors = ConsumptionCalculationService.validateCalculation(calculation!.calculation);

      expect(errors).toHaveLength(0);
    });

    it('should detect invalid calculations', () => {
      const invalidCalc = {
        id: 'test',
        buildingId: 'building-1',
        meterCode: 'METER-001',
        currentIndex: 1000,
        previousIndex: 1100, // Invalid: current < previous without reset
        consumption: -100,
        baseCost: 100,
        taxAmount: 20,
        totalCost: 50, // Invalid: totalCost !== baseCost + taxAmount
        tariffId: 'tariff-1',
        billingPeriodStart: 0,
        billingPeriodEnd: 0,
      };

      const errors = ConsumptionCalculationService.validateCalculation(invalidCalc);

      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // Edge Cases
  describe('edge cases', () => {
    it('should handle zero consumption', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000); // Same reading

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const calculation = ConsumptionCalculationService.calculateConsumption(
        r2.id,
        r1.id,
        undefined,
        undefined,
        tariff
      );

      expect(calculation?.calculation.consumption).toBe(0);
      expect(calculation?.calculation.baseCost).toBe(0);
      expect(calculation?.calculation.totalCost).toBe(0);
    });

    it('should handle large meter indices', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading(
        'building-1',
        'METER-001',
        999999999
      );
      const r2 = ConsumptionCalculationService.recordMeterReading(
        'building-1',
        'METER-001',
        1000000000
      );

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 20,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const calculation = ConsumptionCalculationService.calculateConsumption(
        r2.id,
        r1.id,
        undefined,
        undefined,
        tariff
      );

      expect(calculation?.calculation.consumption).toBe(1);
    });

    it('should handle very high tax percentages', () => {
      const r1 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1000);
      const r2 = ConsumptionCalculationService.recordMeterReading('building-1', 'METER-001', 1100);

      const tariff: TariffConfiguration = {
        id: 'tariff-1',
        buildingId: 'building-1',
        name: 'Standard Tariff',
        type: 'fixed',
        baseRate: 2.5,
        currency: 'EUR',
        taxPercentage: 100, // 100% tax
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      };

      const calculation = ConsumptionCalculationService.calculateConsumption(
        r2.id,
        r1.id,
        undefined,
        undefined,
        tariff
      );

      expect(calculation?.calculation.taxAmount).toBe(calculation?.calculation.baseCost);
      expect(calculation?.calculation.totalCost).toBe(
        calculation?.calculation.baseCost! * 2
      );
    });
  });
});
