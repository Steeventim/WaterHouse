/**
 * Tests for ReadingValidator
 */

import { ReadingValidator, ValidationContext } from '../services/ReadingValidator';

describe('ReadingValidator', () => {
  const mockContext: ValidationContext = {
    previousReading: 100,
    initialReading: 50,
    meterType: 'water',
    meterSerialNumber: 'WTR-001',
  };

  describe('parseInput', () => {
    it('should parse valid integer', () => {
      const result = ReadingValidator.parseInput('150');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(150);
    });

    it('should parse valid decimal', () => {
      const result = ReadingValidator.parseInput('150.25');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(150.25);
    });

    it('should reject more than 2 decimals', () => {
      const result = ReadingValidator.parseInput('150.255');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('décimales');
    });

    it('should reject negative values', () => {
      const result = ReadingValidator.parseInput('-150');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('négatif');
    });

    it('should reject non-numeric input', () => {
      const result = ReadingValidator.parseInput('abc');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('Format invalide');
    });

    it('should handle empty input', () => {
      const result = ReadingValidator.parseInput('');
      expect(result.valid).toBe(true);
      expect(result.value).toBe(null);
    });

    it('should reject excessive values', () => {
      const result = ReadingValidator.parseInput('999999999');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('trop élevé');
    });
  });

  describe('validateReading', () => {
    it('should validate correct reading', () => {
      const result = ReadingValidator.validateReading('200', mockContext);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.canSubmit).toBe(true);
    });

    it('should reject reading lower than initial', () => {
      const result = ReadingValidator.validateReading('40', mockContext);

      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({ code: 'LOWER_THAN_INITIAL' })
      );
      expect(result.canSubmit).toBe(false);
    });

    it('should error on reading lower than previous (REQ-INPUT-006)', () => {
      const result = ReadingValidator.validateReading('90', mockContext);

      expect(result.errors).toContainEqual(
        expect.objectContaining({
          code: 'LOWER_THAN_PREVIOUS',
          canOverride: true,
        })
      );
      expect(result.requiresComment).toBe(true);
    });

    it('should warn on high consumption', () => {
      const result = ReadingValidator.validateReading('1200', mockContext);

      expect(result.warnings).toContainEqual(
        expect.objectContaining({ code: 'HIGH_CONSUMPTION' })
      );
    });

    it('should info on normal consumption', () => {
      const result = ReadingValidator.validateReading('150', mockContext);

      expect(result.infos).toContainEqual(
        expect.objectContaining({ code: 'NORMAL_CONSUMPTION' })
      );
    });

    it('should info on zero consumption', () => {
      const result = ReadingValidator.validateReading('100', mockContext);

      expect(result.infos).toContainEqual(
        expect.objectContaining({ code: 'NO_CONSUMPTION' })
      );
    });

    it('should require comment when overriding negative consumption', () => {
      const result = ReadingValidator.validateReading('80', mockContext);

      expect(result.requiresComment).toBe(true);
      expect(
        result.errors.find(e => e.code === 'LOWER_THAN_PREVIOUS')?.canOverride
      ).toBe(true);
    });

    it('should handle empty input', () => {
      const result = ReadingValidator.validateReading('', mockContext);

      expect(result.valid).toBe(false);
      expect(result.infos).toContainEqual(
        expect.objectContaining({ code: 'EMPTY_INPUT' })
      );
      expect(result.canSubmit).toBe(false);
    });
  });

  describe('getStatusColor', () => {
    it('should return red for errors', () => {
      const result = ReadingValidator.validateReading('40', mockContext);
      const color = ReadingValidator.getStatusColor(result);
      expect(color).toBe('#f44336');
    });

    it('should return orange for warnings', () => {
      const result = ReadingValidator.validateReading('1200', mockContext);
      const color = ReadingValidator.getStatusColor(result);
      expect(color).toBe('#ff9800');
    });

    it('should return blue for infos only', () => {
      const result = ReadingValidator.validateReading('100', mockContext);
      const color = ReadingValidator.getStatusColor(result);
      expect(color).toBe('#2196F3');
    });

    it('should return green for valid', () => {
      const result = ReadingValidator.validateReading('200', mockContext);
      const color = ReadingValidator.getStatusColor(result);
      expect(color).toBe('#4caf50');
    });
  });

  describe('getStatusIcon', () => {
    it('should return checkmark for valid', () => {
      const result = ReadingValidator.validateReading('200', mockContext);
      const icon = ReadingValidator.getStatusIcon(result);
      expect(icon).toBe('✓');
    });

    it('should return X for errors', () => {
      const result = ReadingValidator.validateReading('40', mockContext);
      const icon = ReadingValidator.getStatusIcon(result);
      expect(icon).toBe('✕');
    });

    it('should return warning for warnings', () => {
      const result = ReadingValidator.validateReading('1200', mockContext);
      const icon = ReadingValidator.getStatusIcon(result);
      expect(icon).toBe('⚠');
    });
  });

  describe('formatValidationMessage', () => {
    it('should format multiple errors', () => {
      const errors = [
        {
          type: 'error' as const,
          code: 'ERR1',
          message: 'Error 1',
          canOverride: false,
        },
        {
          type: 'error' as const,
          code: 'ERR2',
          message: 'Error 2',
          canOverride: false,
        },
      ];

      const formatted = ReadingValidator.formatValidationMessage(errors);
      expect(formatted).toBe('Error 1\nError 2');
    });
  });
});
