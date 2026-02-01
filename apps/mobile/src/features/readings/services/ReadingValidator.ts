/**
 * ReadingValidator - Real-time meter reading validation
 * Story 3.3: Validation en temps réel
 */

export interface ValidationError {
  type: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  canOverride: boolean;
}

export interface ReadingValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  infos: ValidationError[];
  canSubmit: boolean;
  requiresComment: boolean;
}

export interface ValidationContext {
  previousReading: number;
  initialReading: number;
  meterType?: string;
  meterSerialNumber?: string;
  lastReadingDate?: string;
}

export class ReadingValidator {
  /**
   * Validate meter reading value in real-time
   */
  static validateReading(
    currentValue: string | number,
    context: ValidationContext
  ): ReadingValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const infos: ValidationError[] = [];

    // Parse input
    const parsed = this.parseInput(currentValue);
    if (!parsed.valid) {
      errors.push({
        type: 'error',
        code: 'INVALID_FORMAT',
        message: parsed.message,
        canOverride: false,
      });
      return {
        valid: false,
        errors,
        warnings,
        infos,
        canSubmit: false,
        requiresComment: false,
      };
    }

    const value = parsed.value;

    // Check if empty
    if (value === null) {
      infos.push({
        type: 'info',
        code: 'EMPTY_INPUT',
        message: 'Veuillez saisir une valeur',
        canOverride: false,
      });
      return {
        valid: false,
        errors,
        warnings,
        infos,
        canSubmit: false,
        requiresComment: false,
      };
    }

    // Check minimum value (> initial reading)
    if (value < context.initialReading) {
      errors.push({
        type: 'error',
        code: 'LOWER_THAN_INITIAL',
        message: `L'index (${value}) est inférieur à l'index initial (${context.initialReading})`,
        canOverride: false,
      });
    }

    // Check against previous reading (REQ-INPUT-006)
    if (value < context.previousReading) {
      errors.push({
        type: 'error',
        code: 'LOWER_THAN_PREVIOUS',
        message: `L'index (${value}) est inférieur au relevé précédent (${context.previousReading}). Un commentaire est obligatoire pour forcer.`,
        canOverride: true, // Can override with comment
      });
    }

    // Calculate consumption
    const consumption = value - context.previousReading;

    // Warning: unusual consumption patterns
    if (consumption > 1000) {
      warnings.push({
        type: 'warning',
        code: 'HIGH_CONSUMPTION',
        message: `Consommation très élevée : ${consumption} unités. Vérifiez l'index saisi.`,
        canOverride: true,
      });
    }

    // Warning: negative consumption
    if (consumption < 0) {
      warnings.push({
        type: 'warning',
        code: 'NEGATIVE_CONSUMPTION',
        message: `Consommation négative : ${consumption} unités. Cela n'est pas normal.`,
        canOverride: true,
      });
    }

    // Warning: very low consumption
    if (consumption === 0) {
      infos.push({
        type: 'info',
        code: 'NO_CONSUMPTION',
        message: 'Pas de consommation détectée depuis le dernier relevé',
        canOverride: true,
      });
    }

    // Info: normal consumption range
    if (consumption > 0 && consumption <= 100) {
      infos.push({
        type: 'info',
        code: 'NORMAL_CONSUMPTION',
        message: `Consommation normale : ${consumption} unités`,
        canOverride: false,
      });
    }

    // Determine if can submit
    const hasBlockingErrors = errors.filter(e => e.code === 'LOWER_THAN_INITIAL').length > 0;

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      infos,
      canSubmit: !hasBlockingErrors,
      requiresComment: errors.some(e => e.code === 'LOWER_THAN_PREVIOUS'),
    };
  }

  /**
   * Parse and validate input format
   */
  static parseInput(
    value: string | number
  ): { valid: boolean; value: number | null; message: string } {
    // Handle empty input
    if (value === '' || value === null || value === undefined) {
      return { valid: true, value: null, message: '' };
    }

    // Convert to string if number
    const strValue = String(value).trim();

    // Check for negative
    if (strValue.startsWith('-')) {
      return {
        valid: false,
        value: null,
        message: 'L\'index ne peut pas être négatif',
      };
    }

    // Try to parse as float
    const parsed = parseFloat(strValue);

    if (isNaN(parsed)) {
      return {
        valid: false,
        value: null,
        message: 'Format invalide. Veuillez saisir un nombre.',
      };
    }

    // Check for excessive decimal places
    const decimalPlaces = (strValue.split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return {
        valid: false,
        value: null,
        message: 'Maximum 2 décimales autorisées',
      };
    }

    // Check for excessive value length
    if (parsed > 99999999) {
      return {
        valid: false,
        value: null,
        message: 'Index trop élevé (max 99999999)',
      };
    }

    return { valid: true, value: parsed, message: '' };
  }

  /**
   * Get validation status color
   */
  static getStatusColor(result: ReadingValidationResult): string {
    if (result.errors.length > 0) return '#f44336'; // Red
    if (result.warnings.length > 0) return '#ff9800'; // Orange
    if (result.infos.length > 0) return '#2196F3'; // Blue
    return '#4caf50'; // Green (valid)
  }

  /**
   * Get validation status icon
   */
  static getStatusIcon(result: ReadingValidationResult): string {
    if (result.errors.length > 0) return '✕';
    if (result.warnings.length > 0) return '⚠';
    if (result.infos.length > 0) return 'ℹ';
    return '✓';
  }

  /**
   * Format validation message for display
   */
  static formatValidationMessage(errors: ValidationError[]): string {
    return errors.map(e => e.message).join('\n');
  }
}
