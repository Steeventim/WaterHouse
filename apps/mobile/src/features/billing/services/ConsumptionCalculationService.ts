import { TariffConfigurationService, TariffConfiguration } from './TariffConfigurationService';

export interface MeterReading {
  id: string;
  buildingId: string;
  meterCode: string;
  index: number;
  timestamp: number;
  notes?: string;
}

export interface ConsumptionCalculation {
  id: string;
  readingId: string;
  previousReadingId: string;
  buildingId: string;
  meterCode: string;
  previousIndex: number;
  currentIndex: number;
  consumption: number;
  baseCost: number;
  taxAmount: number;
  totalCost: number;
  tariffId: string;
  calculatedAt: number;
  billingPeriodStart: number;
  billingPeriodEnd: number;
}

export interface ConsumptionCalculationDetails {
  calculation: ConsumptionCalculation;
  tariff: TariffConfiguration;
  breakdownByTier?: Array<{
    tierMin: number;
    tierMax: number;
    tierConsumption: number;
    ratePerUnit: number;
    tierCost: number;
  }>;
  audit: {
    formula: string;
    variables: Record<string, number | string>;
  };
}

export class ConsumptionCalculationService {
  private static calculations: Map<string, ConsumptionCalculation> = new Map();
  private static meterReadings: Map<string, MeterReading> = new Map();

  /**
   * Record a meter reading
   */
  static recordMeterReading(
    buildingId: string,
    meterCode: string,
    index: number,
    notes?: string
  ): MeterReading {
    const reading: MeterReading = {
      id: `reading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      buildingId,
      meterCode,
      index,
      timestamp: Date.now(),
      notes,
    };

    this.meterReadings.set(reading.id, reading);
    return reading;
  }

  /**
   * Get meter reading by ID
   */
  static getMeterReading(readingId: string): MeterReading | undefined {
    return this.meterReadings.get(readingId);
  }

  /**
   * Get all readings for a meter
   */
  static getReadingsForMeter(
    buildingId: string,
    meterCode: string,
    limit = 100
  ): MeterReading[] {
    return Array.from(this.meterReadings.values())
      .filter((r) => r.buildingId === buildingId && r.meterCode === meterCode)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get previous reading for a meter
   */
  static getPreviousReading(
    buildingId: string,
    meterCode: string,
    beforeTimestamp: number
  ): MeterReading | undefined {
    const readings = Array.from(this.meterReadings.values())
      .filter(
        (r) =>
          r.buildingId === buildingId &&
          r.meterCode === meterCode &&
          r.timestamp < beforeTimestamp
      )
      .sort((a, b) => b.timestamp - a.timestamp);

    return readings[0];
  }

  /**
   * Calculate consumption between two readings
   */
  static calculateConsumption(
    currentReadingId: string,
    previousReadingId?: string,
    billingPeriodStart?: number,
    billingPeriodEnd?: number
  ): ConsumptionCalculationDetails | null {
    const currentReading = this.getMeterReading(currentReadingId);
    if (!currentReading) return null;

    // Get previous reading
    let previousReading = previousReadingId
      ? this.getMeterReading(previousReadingId)
      : this.getPreviousReading(
          currentReading.buildingId,
          currentReading.meterCode,
          currentReading.timestamp
        );

    if (!previousReading) {
      // No previous reading, use current index as both previous and current
      previousReading = {
        ...currentReading,
        id: `reference-${currentReading.id}`,
        index: currentReading.index,
      };
    }

    // Get tariff configuration
    const tariff = TariffConfigurationService.getActiveTariff(
      currentReading.buildingId
    );
    if (!tariff) return null;

    // Validate reading progression
    if (currentReading.index < previousReading.index) {
      // Handle meter reset - calculate from 0 to current
      return this.handleMeterReset(
        currentReading,
        previousReading,
        tariff,
        billingPeriodStart,
        billingPeriodEnd
      );
    }

    // Calculate consumption
    const consumption = currentReading.index - previousReading.index;

    // Calculate cost
    const costResult = TariffConfigurationService.calculateCost(
      tariff.id,
      previousReading.index,
      currentReading.index
    );

    if (!costResult) return null;

    // Create calculation record
    const calculation: ConsumptionCalculation = {
      id: `calc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      readingId: currentReadingId,
      previousReadingId: previousReading.id,
      buildingId: currentReading.buildingId,
      meterCode: currentReading.meterCode,
      previousIndex: previousReading.index,
      currentIndex: currentReading.index,
      consumption,
      baseCost: costResult.baseAmount,
      taxAmount: costResult.taxAmount,
      totalCost: costResult.totalAmount,
      tariffId: tariff.id,
      calculatedAt: Date.now(),
      billingPeriodStart: billingPeriodStart || previousReading.timestamp,
      billingPeriodEnd: billingPeriodEnd || currentReading.timestamp,
    };

    this.calculations.set(calculation.id, calculation);

    // Build breakdown for tiered/progressive rates
    let breakdownByTier: ConsumptionCalculationDetails['breakdownByTier'];
    if (tariff.tierRates) {
      breakdownByTier = this.buildTierBreakdown(
        previousReading.index,
        currentReading.index,
        tariff.tierRates
      );
    }

    return {
      calculation,
      tariff,
      breakdownByTier,
      audit: {
        formula: `(${currentReading.index} - ${previousReading.index}) × ${tariff.baseRate} + (taxes ${tariff.taxPercentage}%)`,
        variables: {
          currentIndex: currentReading.index,
          previousIndex: previousReading.index,
          consumption,
          baseRate: tariff.baseRate,
          taxPercentage: tariff.taxPercentage,
          baseCost: costResult.baseAmount,
          taxAmount: costResult.taxAmount,
          totalCost: costResult.totalAmount,
        },
      },
    };
  }

  /**
   * Handle meter reset scenario
   */
  private static handleMeterReset(
    currentReading: MeterReading,
    previousReading: MeterReading,
    tariff: TariffConfiguration,
    billingPeriodStart?: number,
    billingPeriodEnd?: number
  ): ConsumptionCalculationDetails | null {
    // Calculate consumption from both before reset and after reset
    const consumptionBefore = 9999 - previousReading.index; // Assume max meter value is 9999
    const consumptionAfter = currentReading.index - 0;
    const totalConsumption = consumptionBefore + consumptionAfter;

    // Calculate cost for the reset scenario
    const costBefore = TariffConfigurationService.calculateCost(
      tariff.id,
      previousReading.index,
      9999
    );
    const costAfter = TariffConfigurationService.calculateCost(
      tariff.id,
      0,
      currentReading.index
    );

    if (!costBefore || !costAfter) return null;

    const baseCost = costBefore.baseAmount + costAfter.baseAmount;
    const taxAmount = costBefore.taxAmount + costAfter.taxAmount;
    const totalCost = costBefore.totalAmount + costAfter.totalAmount;

    const calculation: ConsumptionCalculation = {
      id: `calc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      readingId: currentReading.id,
      previousReadingId: previousReading.id,
      buildingId: currentReading.buildingId,
      meterCode: currentReading.meterCode,
      previousIndex: previousReading.index,
      currentIndex: currentReading.index,
      consumption: totalConsumption,
      baseCost,
      taxAmount,
      totalCost,
      tariffId: tariff.id,
      calculatedAt: Date.now(),
      billingPeriodStart: billingPeriodStart || previousReading.timestamp,
      billingPeriodEnd: billingPeriodEnd || currentReading.timestamp,
    };

    this.calculations.set(calculation.id, calculation);

    return {
      calculation,
      tariff,
      audit: {
        formula: `(9999 - ${previousReading.index}) + ${currentReading.index} = ${totalConsumption} units (meter reset detected)`,
        variables: {
          previousIndex: previousReading.index,
          currentIndex: currentReading.index,
          consumptionBeforeReset: consumptionBefore,
          consumptionAfterReset: consumptionAfter,
          totalConsumption,
          baseCost,
          taxAmount,
          totalCost,
        },
      },
    };
  }

  /**
   * Build breakdown by tier for tiered tariffs
   */
  private static buildTierBreakdown(
    previousIndex: number,
    currentIndex: number,
    tierRates: Array<{ minIndex: number; maxIndex: number; ratePerUnit: number }>
  ): ConsumptionCalculationDetails['breakdownByTier'] {
    const breakdown: ConsumptionCalculationDetails['breakdownByTier'] = [];

    for (const tier of tierRates) {
      const tierMin = Math.max(previousIndex, tier.minIndex);
      const tierMax = Math.min(currentIndex, tier.maxIndex);

      if (tierMin <= tierMax) {
        const tierConsumption = tierMax - tierMin;
        const tierCost = tierConsumption * tier.ratePerUnit;

        breakdown.push({
          tierMin,
          tierMax,
          tierConsumption,
          ratePerUnit: tier.ratePerUnit,
          tierCost,
        });
      }
    }

    return breakdown;
  }

  /**
   * Get calculation by ID
   */
  static getCalculation(calculationId: string): ConsumptionCalculation | undefined {
    return this.calculations.get(calculationId);
  }

  /**
   * Get calculations for a building
   */
  static getCalculationsByBuilding(buildingId: string, limit = 50): ConsumptionCalculation[] {
    return Array.from(this.calculations.values())
      .filter((c) => c.buildingId === buildingId)
      .sort((a, b) => b.calculatedAt - a.calculatedAt)
      .slice(0, limit);
  }

  /**
   * Get calculations for a meter
   */
  static getCalculationsByMeter(
    buildingId: string,
    meterCode: string,
    limit = 50
  ): ConsumptionCalculation[] {
    return Array.from(this.calculations.values())
      .filter((c) => c.buildingId === buildingId && c.meterCode === meterCode)
      .sort((a, b) => b.calculatedAt - a.calculatedAt)
      .slice(0, limit);
  }

  /**
   * Get calculations for billing period
   */
  static getCalculationsByBillingPeriod(
    buildingId: string,
    startTime: number,
    endTime: number
  ): ConsumptionCalculation[] {
    return Array.from(this.calculations.values()).filter(
      (c) =>
        c.buildingId === buildingId &&
        c.billingPeriodStart >= startTime &&
        c.billingPeriodEnd <= endTime
    );
  }

  /**
   * Get calculation summary for building
   */
  static getCalculationSummary(buildingId: string): {
    totalConsumption: number;
    totalBaseCost: number;
    totalTaxAmount: number;
    totalCost: number;
    calculationCount: number;
  } {
    const calculations = this.getCalculationsByBuilding(buildingId, 1000);

    return {
      totalConsumption: calculations.reduce((sum, c) => sum + c.consumption, 0),
      totalBaseCost: calculations.reduce((sum, c) => sum + c.baseCost, 0),
      totalTaxAmount: calculations.reduce((sum, c) => sum + c.taxAmount, 0),
      totalCost: calculations.reduce((sum, c) => sum + c.totalCost, 0),
      calculationCount: calculations.length,
    };
  }

  /**
   * Validate calculation consistency
   */
  static validateCalculation(calculation: ConsumptionCalculation): string[] {
    const errors: string[] = [];

    if (calculation.consumption <= 0) {
      errors.push('Consumption must be positive');
    }

    if (calculation.currentIndex < calculation.previousIndex && calculation.consumption < 0) {
      errors.push('Invalid index progression and consumption mismatch');
    }

    if (calculation.baseCost < 0) {
      errors.push('Base cost must be non-negative');
    }

    if (calculation.taxAmount < 0) {
      errors.push('Tax amount must be non-negative');
    }

    if (Math.abs(calculation.totalCost - (calculation.baseCost + calculation.taxAmount)) > 0.01) {
      errors.push('Total cost does not match base cost plus tax');
    }

    if (calculation.billingPeriodStart >= calculation.billingPeriodEnd) {
      errors.push('Billing period start must be before end');
    }

    return errors;
  }

  /**
   * Clear all data (useful for testing)
   */
  static clear(): void {
    this.calculations.clear();
    this.meterReadings.clear();
  }
}
