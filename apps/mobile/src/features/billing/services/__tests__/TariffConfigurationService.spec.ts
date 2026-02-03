import {
  TariffConfigurationService,
  TariffType,
  TariffConfiguration,
} from './TariffConfigurationService';

describe('TariffConfigurationService', () => {
  beforeEach(() => {
    TariffConfigurationService.clear();
  });

  describe('createTariff', () => {
    it('should create a fixed rate tariff', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Water Rate',
        TariffType.FIXED,
        1.5,
        10
      );

      expect(tariff.name).toBe('Water Rate');
      expect(tariff.type).toBe(TariffType.FIXED);
      expect(tariff.baseRate).toBe(1.5);
      expect(tariff.taxPercentage).toBe(10);
      expect(tariff.isActive).toBe(true);
    });

    it('should create a progressive tariff', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Progressive Rate',
        TariffType.PROGRESSIVE,
        2.0,
        10
      );

      expect(tariff.type).toBe(TariffType.PROGRESSIVE);
    });
  });

  describe('getTariff', () => {
    it('should retrieve tariff by ID', () => {
      const created = TariffConfigurationService.createTariff(
        'building-1',
        'Test Rate',
        TariffType.FIXED,
        1.0,
        10
      );

      const retrieved = TariffConfigurationService.getTariff(created.id);
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Rate');
    });

    it('should return undefined for non-existent tariff', () => {
      const result = TariffConfigurationService.getTariff('non-existent');
      expect(result).toBeUndefined();
    });
  });

  describe('getTariffsByBuilding', () => {
    it('should return tariffs for specific building', () => {
      TariffConfigurationService.createTariff('building-1', 'Rate 1', TariffType.FIXED, 1.0, 10);
      TariffConfigurationService.createTariff('building-1', 'Rate 2', TariffType.FIXED, 2.0, 10);
      TariffConfigurationService.createTariff('building-2', 'Rate 3', TariffType.FIXED, 3.0, 10);

      const building1Tariffs = TariffConfigurationService.getTariffsByBuilding('building-1');
      expect(building1Tariffs).toHaveLength(2);
    });
  });

  describe('getActiveTariff', () => {
    it('should return active tariff for building', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Active Rate',
        TariffType.FIXED,
        1.0,
        10
      );

      const active = TariffConfigurationService.getActiveTariff('building-1');
      expect(active?.id).toBe(tariff.id);
    });

    it('should return undefined if no active tariff', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Rate',
        TariffType.FIXED,
        1.0,
        10
      );
      TariffConfigurationService.updateTariff(tariff.id, { isActive: false });

      const active = TariffConfigurationService.getActiveTariff('building-1');
      expect(active).toBeUndefined();
    });
  });

  describe('setActiveTariff', () => {
    it('should activate tariff and deactivate others', () => {
      const tariff1 = TariffConfigurationService.createTariff(
        'building-1',
        'Rate 1',
        TariffType.FIXED,
        1.0,
        10
      );
      const tariff2 = TariffConfigurationService.createTariff(
        'building-1',
        'Rate 2',
        TariffType.FIXED,
        2.0,
        10
      );

      TariffConfigurationService.setActiveTariff('building-1', tariff2.id);

      expect(TariffConfigurationService.getTariff(tariff1.id)?.isActive).toBe(false);
      expect(TariffConfigurationService.getTariff(tariff2.id)?.isActive).toBe(true);
    });
  });

  describe('addProgressiveRate', () => {
    it('should add progressive rate step', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Progressive',
        TariffType.PROGRESSIVE,
        0,
        10
      );

      TariffConfigurationService.addProgressiveRate(tariff.id, 0, 100, 1.5);
      TariffConfigurationService.addProgressiveRate(tariff.id, 100, 500, 2.0);

      const updated = TariffConfigurationService.getTariff(tariff.id);
      expect(updated?.progressiveRates).toHaveLength(2);
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for fixed rate', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Fixed Rate',
        TariffType.FIXED,
        2.0,
        10
      );

      const result = TariffConfigurationService.calculateCost(tariff.id, 0, 100);

      expect(result?.baseAmount).toBe(200);
      expect(result?.taxAmount).toBe(20);
      expect(result?.totalAmount).toBe(220);
    });

    it('should calculate cost for progressive rate', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Progressive',
        TariffType.PROGRESSIVE,
        0,
        10
      );

      TariffConfigurationService.addProgressiveRate(tariff.id, 0, 100, 1.5);
      TariffConfigurationService.addProgressiveRate(tariff.id, 100, 500, 2.0);

      const result = TariffConfigurationService.calculateCost(tariff.id, 0, 150);

      expect(result?.baseAmount).toBeCloseTo(300, 0);
      expect(result?.taxAmount).toBeCloseTo(30, 0);
    });

    it('should apply minimum charge', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Min Charge',
        TariffType.FIXED,
        1.0,
        10
      );

      TariffConfigurationService.updateTariff(tariff.id, { minimumCharge: 50 });

      const result = TariffConfigurationService.calculateCost(tariff.id, 0, 10);

      expect(result?.baseAmount).toBe(50);
    });

    it('should apply maximum charge', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Max Charge',
        TariffType.FIXED,
        5.0,
        10
      );

      TariffConfigurationService.updateTariff(tariff.id, { maximumCharge: 100 });

      const result = TariffConfigurationService.calculateCost(tariff.id, 0, 100);

      expect(result?.baseAmount).toBe(100);
    });

    it('should calculate tiered rates correctly', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Tiered',
        TariffType.TIERED,
        0,
        10
      );

      TariffConfigurationService.addTierRate(tariff.id, 0, 50, 1.0);
      TariffConfigurationService.addTierRate(tariff.id, 50, 200, 1.5);

      const result = TariffConfigurationService.calculateCost(tariff.id, 0, 100);

      // First 50 units at 1.0 = 50, next 50 units at 1.5 = 75, total = 125
      expect(result?.baseAmount).toBe(125);
    });
  });

  describe('updateTariff', () => {
    it('should update tariff configuration', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Original',
        TariffType.FIXED,
        1.0,
        10
      );

      TariffConfigurationService.updateTariff(tariff.id, {
        name: 'Updated',
        baseRate: 2.0,
      });

      const updated = TariffConfigurationService.getTariff(tariff.id);
      expect(updated?.name).toBe('Updated');
      expect(updated?.baseRate).toBe(2.0);
      expect(updated?.createdAt).toBe(tariff.createdAt);
    });
  });

  describe('validateTariff', () => {
    it('should validate tariff configuration', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Test',
        TariffType.FIXED,
        1.0,
        10
      );

      const errors = TariffConfigurationService.validateTariff(tariff);
      expect(errors).toHaveLength(0);
    });

    it('should report invalid tax percentage', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Test',
        TariffType.FIXED,
        1.0,
        150
      );

      const errors = TariffConfigurationService.validateTariff(tariff);
      expect(errors).toContain('Tax percentage must be between 0 and 100');
    });

    it('should report invalid minimum/maximum charge', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Test',
        TariffType.FIXED,
        1.0,
        10
      );

      TariffConfigurationService.updateTariff(tariff.id, {
        minimumCharge: 100,
        maximumCharge: 50,
      });

      const updated = TariffConfigurationService.getTariff(tariff.id) as TariffConfiguration;
      const errors = TariffConfigurationService.validateTariff(updated);
      expect(errors).toContain('Minimum charge cannot exceed maximum charge');
    });
  });

  describe('createFormula', () => {
    it('should create billing formula', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Rate',
        TariffType.FIXED,
        1.0,
        10
      );

      const formula = TariffConfigurationService.createFormula(
        tariff.id,
        '(consumption * rate) + taxes',
        {
          consumption: 'currentIndex - previousIndex',
          rate: 'baseRate',
          taxes: '(consumption * rate) * (taxPercentage / 100)',
        }
      );

      expect(formula.tariffId).toBe(tariff.id);
      expect(formula.formula).toBe('(consumption * rate) + taxes');
    });
  });

  describe('getFormulasByTariff', () => {
    it('should retrieve formulas for tariff', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Rate',
        TariffType.FIXED,
        1.0,
        10
      );

      TariffConfigurationService.createFormula(tariff.id, 'formula1', {});
      TariffConfigurationService.createFormula(tariff.id, 'formula2', {});

      const formulas = TariffConfigurationService.getFormulasByTariff(tariff.id);
      expect(formulas).toHaveLength(2);
    });
  });

  describe('exportTariff', () => {
    it('should export tariff to JSON', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Export Test',
        TariffType.FIXED,
        1.5,
        10
      );

      const json = TariffConfigurationService.exportTariff(tariff.id);
      expect(json).toBeTruthy();

      const parsed = JSON.parse(json as string);
      expect(parsed.name).toBe('Export Test');
      expect(parsed.baseRate).toBe(1.5);
    });
  });

  describe('importTariff', () => {
    it('should import tariff from JSON', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Import Test',
        TariffType.FIXED,
        2.0,
        15
      );

      const json = TariffConfigurationService.exportTariff(tariff.id) as string;
      const imported = TariffConfigurationService.importTariff(json, 'building-2');

      expect(imported?.name).toBe('Import Test');
      expect(imported?.baseRate).toBe(2.0);
      expect(imported?.buildingId).toBe('building-2');
    });
  });

  describe('deleteTariff', () => {
    it('should delete tariff', () => {
      const tariff = TariffConfigurationService.createTariff(
        'building-1',
        'Delete Test',
        TariffType.FIXED,
        1.0,
        10
      );

      const success = TariffConfigurationService.deleteTariff(tariff.id);
      expect(success).toBe(true);
      expect(TariffConfigurationService.getTariff(tariff.id)).toBeUndefined();
    });
  });
});
