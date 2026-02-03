export enum TariffType {
  FIXED = 'fixed',
  PROGRESSIVE = 'progressive',
  TIERED = 'tiered',
}

export interface ProgressiveRateStep {
  minIndex: number;
  maxIndex: number;
  ratePerUnit: number;
}

export interface TierStep {
  minIndex: number;
  maxIndex: number;
  ratePerUnit: number;
}

export interface TariffConfiguration {
  id: string;
  buildingId: string;
  name: string;
  type: TariffType;
  description?: string;
  baseRate: number; // Base rate per unit
  currency: string;
  taxPercentage: number; // Tax percentage (e.g., 10 for 10%)
  progressiveRates?: ProgressiveRateStep[];
  tierRates?: TierStep[];
  minimumCharge?: number;
  maximumCharge?: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BillingFormula {
  id: string;
  tariffId: string;
  formula: string; // Expression like "(consumption * rate) + taxes"
  description?: string;
  variables: Record<string, string>; // Variable definitions
  createdAt: number;
  updatedAt: number;
}

export class TariffConfigurationService {
  private static tariffs: Map<string, TariffConfiguration> = new Map();
  private static formulas: Map<string, BillingFormula> = new Map();
  private static defaultTariff: TariffConfiguration | null = null;

  /**
   * Create a new tariff configuration
   */
  static createTariff(
    buildingId: string,
    name: string,
    type: TariffType,
    baseRate: number,
    taxPercentage: number
  ): TariffConfiguration {
    const tariff: TariffConfiguration = {
      id: `tariff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      buildingId,
      name,
      type,
      baseRate,
      currency: 'EUR',
      taxPercentage,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.tariffs.set(tariff.id, tariff);
    return tariff;
  }

  /**
   * Update tariff configuration
   */
  static updateTariff(
    tariffId: string,
    updates: Partial<TariffConfiguration>
  ): TariffConfiguration | undefined {
    const tariff = this.tariffs.get(tariffId);
    if (!tariff) return undefined;

    const updated = {
      ...tariff,
      ...updates,
      id: tariff.id, // Preserve ID
      createdAt: tariff.createdAt, // Preserve creation time
      updatedAt: Date.now(),
    };

    this.tariffs.set(tariffId, updated);
    return updated;
  }

  /**
   * Get tariff by ID
   */
  static getTariff(tariffId: string): TariffConfiguration | undefined {
    return this.tariffs.get(tariffId);
  }

  /**
   * Get all tariffs for a building
   */
  static getTariffsByBuilding(buildingId: string): TariffConfiguration[] {
    return Array.from(this.tariffs.values()).filter(
      (t) => t.buildingId === buildingId
    );
  }

  /**
   * Get active tariff for building
   */
  static getActiveTariff(buildingId: string): TariffConfiguration | undefined {
    return Array.from(this.tariffs.values()).find(
      (t) => t.buildingId === buildingId && t.isActive
    );
  }

  /**
   * Set active tariff for building
   */
  static setActiveTariff(buildingId: string, tariffId: string): boolean {
    const tariff = this.tariffs.get(tariffId);
    if (!tariff || tariff.buildingId !== buildingId) {
      return false;
    }

    // Deactivate other tariffs for this building
    Array.from(this.tariffs.values()).forEach((t) => {
      if (t.buildingId === buildingId && t.id !== tariffId) {
        t.isActive = false;
        t.updatedAt = Date.now();
      }
    });

    // Activate the selected tariff
    tariff.isActive = true;
    tariff.updatedAt = Date.now();

    return true;
  }

  /**
   * Add progressive rate step
   */
  static addProgressiveRate(
    tariffId: string,
    minIndex: number,
    maxIndex: number,
    ratePerUnit: number
  ): TariffConfiguration | undefined {
    const tariff = this.tariffs.get(tariffId);
    if (!tariff || tariff.type !== TariffType.PROGRESSIVE) {
      return undefined;
    }

    if (!tariff.progressiveRates) {
      tariff.progressiveRates = [];
    }

    tariff.progressiveRates.push({
      minIndex,
      maxIndex,
      ratePerUnit,
    });

    // Sort by minIndex
    tariff.progressiveRates.sort((a, b) => a.minIndex - b.minIndex);
    tariff.updatedAt = Date.now();

    return tariff;
  }

  /**
   * Remove progressive rate step
   */
  static removeProgressiveRate(
    tariffId: string,
    minIndex: number
  ): TariffConfiguration | undefined {
    const tariff = this.tariffs.get(tariffId);
    if (!tariff || !tariff.progressiveRates) {
      return undefined;
    }

    tariff.progressiveRates = tariff.progressiveRates.filter(
      (r) => r.minIndex !== minIndex
    );
    tariff.updatedAt = Date.now();

    return tariff;
  }

  /**
   * Add tiered rate step
   */
  static addTierRate(
    tariffId: string,
    minIndex: number,
    maxIndex: number,
    ratePerUnit: number
  ): TariffConfiguration | undefined {
    const tariff = this.tariffs.get(tariffId);
    if (!tariff || tariff.type !== TariffType.TIERED) {
      return undefined;
    }

    if (!tariff.tierRates) {
      tariff.tierRates = [];
    }

    tariff.tierRates.push({
      minIndex,
      maxIndex,
      ratePerUnit,
    });

    // Sort by minIndex
    tariff.tierRates.sort((a, b) => a.minIndex - b.minIndex);
    tariff.updatedAt = Date.now();

    return tariff;
  }

  /**
   * Remove tiered rate step
   */
  static removeTierRate(
    tariffId: string,
    minIndex: number
  ): TariffConfiguration | undefined {
    const tariff = this.tariffs.get(tariffId);
    if (!tariff || !tariff.tierRates) {
      return undefined;
    }

    tariff.tierRates = tariff.tierRates.filter((r) => r.minIndex !== minIndex);
    tariff.updatedAt = Date.now();

    return tariff;
  }

  /**
   * Delete tariff configuration
   */
  static deleteTariff(tariffId: string): boolean {
    return this.tariffs.delete(tariffId);
  }

  /**
   * Calculate consumption cost based on tariff
   */
  static calculateCost(
    tariffId: string,
    previousIndex: number,
    currentIndex: number
  ): { baseAmount: number; taxAmount: number; totalAmount: number } | null {
    const tariff = this.tariffs.get(tariffId);
    if (!tariff) return null;

    const consumption = currentIndex - previousIndex;

    let baseAmount = 0;

    if (tariff.type === TariffType.FIXED) {
      baseAmount = consumption * tariff.baseRate;
    } else if (
      tariff.type === TariffType.PROGRESSIVE &&
      tariff.progressiveRates
    ) {
      for (const step of tariff.progressiveRates) {
        if (currentIndex >= step.minIndex && currentIndex <= step.maxIndex) {
          baseAmount = consumption * step.ratePerUnit;
          break;
        }
      }
    } else if (tariff.type === TariffType.TIERED && tariff.tierRates) {
      for (const tier of tariff.tierRates) {
        const tierMin = Math.max(previousIndex, tier.minIndex);
        const tierMax = Math.min(currentIndex, tier.maxIndex);

        if (tierMin <= tierMax) {
          const tierConsumption = tierMax - tierMin;
          baseAmount += tierConsumption * tier.ratePerUnit;
        }
      }
    }

    // Apply minimum and maximum charges
    if (tariff.minimumCharge && baseAmount < tariff.minimumCharge) {
      baseAmount = tariff.minimumCharge;
    }
    if (tariff.maximumCharge && baseAmount > tariff.maximumCharge) {
      baseAmount = tariff.maximumCharge;
    }

    const taxAmount = (baseAmount * tariff.taxPercentage) / 100;
    const totalAmount = baseAmount + taxAmount;

    return {
      baseAmount: Math.round(baseAmount * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  /**
   * Create billing formula
   */
  static createFormula(
    tariffId: string,
    formula: string,
    variables: Record<string, string>
  ): BillingFormula {
    const billingFormula: BillingFormula = {
      id: `formula-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tariffId,
      formula,
      variables,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    this.formulas.set(billingFormula.id, billingFormula);
    return billingFormula;
  }

  /**
   * Get formula by ID
   */
  static getFormula(formulaId: string): BillingFormula | undefined {
    return this.formulas.get(formulaId);
  }

  /**
   * Get formulas for tariff
   */
  static getFormulasByTariff(tariffId: string): BillingFormula[] {
    return Array.from(this.formulas.values()).filter(
      (f) => f.tariffId === tariffId
    );
  }

  /**
   * Update formula
   */
  static updateFormula(
    formulaId: string,
    updates: Partial<BillingFormula>
  ): BillingFormula | undefined {
    const formula = this.formulas.get(formulaId);
    if (!formula) return undefined;

    const updated = {
      ...formula,
      ...updates,
      id: formula.id,
      createdAt: formula.createdAt,
      updatedAt: Date.now(),
    };

    this.formulas.set(formulaId, updated);
    return updated;
  }

  /**
   * Delete formula
   */
  static deleteFormula(formulaId: string): boolean {
    return this.formulas.delete(formulaId);
  }

  /**
   * Validate tariff configuration
   */
  static validateTariff(tariff: TariffConfiguration): string[] {
    const errors: string[] = [];

    if (!tariff.name || tariff.name.trim().length === 0) {
      errors.push('Tariff name is required');
    }

    if (tariff.baseRate < 0) {
      errors.push('Base rate must be non-negative');
    }

    if (tariff.taxPercentage < 0 || tariff.taxPercentage > 100) {
      errors.push('Tax percentage must be between 0 and 100');
    }

    if (
      tariff.minimumCharge &&
      tariff.maximumCharge &&
      tariff.minimumCharge > tariff.maximumCharge
    ) {
      errors.push('Minimum charge cannot exceed maximum charge');
    }

    if (tariff.type === TariffType.PROGRESSIVE && tariff.progressiveRates) {
      for (let i = 0; i < tariff.progressiveRates.length - 1; i++) {
        if (tariff.progressiveRates[i].maxIndex >= tariff.progressiveRates[i + 1].minIndex) {
          errors.push(
            `Progressive rate steps must not overlap at index ${tariff.progressiveRates[i].maxIndex}`
          );
        }
      }
    }

    return errors;
  }

  /**
   * Export tariff to JSON
   */
  static exportTariff(tariffId: string): string | null {
    const tariff = this.tariffs.get(tariffId);
    if (!tariff) return null;

    return JSON.stringify(tariff, null, 2);
  }

  /**
   * Import tariff from JSON
   */
  static importTariff(jsonData: string, buildingId: string): TariffConfiguration | null {
    try {
      const data = JSON.parse(jsonData);
      const tariff: TariffConfiguration = {
        ...data,
        id: `tariff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        buildingId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const errors = this.validateTariff(tariff);
      if (errors.length > 0) {
        return null;
      }

      this.tariffs.set(tariff.id, tariff);
      return tariff;
    } catch {
      return null;
    }
  }

  /**
   * Clear all data (useful for testing)
   */
  static clear(): void {
    this.tariffs.clear();
    this.formulas.clear();
    this.defaultTariff = null;
  }
}
