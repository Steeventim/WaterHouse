/**
 * Tests for CameraService
 */

import { CameraService, PhotoMetadata } from '../services/CameraService';

describe('CameraService', () => {
  describe('validatePhoto', () => {
    it('should validate photo with correct dimensions and size', () => {
      const photo: PhotoMetadata = {
        uri: 'file:///test.jpg',
        width: 1920,
        height: 1080,
        fileSize: 2 * 1024 * 1024, // 2MB
        timestamp: new Date().toISOString(),
      };

      const result = CameraService.validatePhoto(photo);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject photo exceeding 10MB', () => {
      const photo: PhotoMetadata = {
        uri: 'file:///test.jpg',
        width: 1920,
        height: 1080,
        fileSize: 11 * 1024 * 1024, // 11MB
        timestamp: new Date().toISOString(),
      };

      const result = CameraService.validatePhoto(photo);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('trop volumineuse'));
    });

    it('should reject photo with low resolution', () => {
      const photo: PhotoMetadata = {
        uri: 'file:///test.jpg',
        width: 320,
        height: 240,
        fileSize: 500 * 1024, // 500KB
        timestamp: new Date().toISOString(),
      };

      const result = CameraService.validatePhoto(photo);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('Résolution trop faible'));
    });

    it('should reject photo with empty URI', () => {
      const photo: PhotoMetadata = {
        uri: '',
        width: 1920,
        height: 1080,
        fileSize: 2 * 1024 * 1024,
        timestamp: new Date().toISOString(),
      };

      const result = CameraService.validatePhoto(photo);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(expect.stringContaining('invalide ou manquante'));
    });
  });

  describe('calculateCompressedDimensions', () => {
    it('should keep dimensions if under max', () => {
      const result = CameraService.calculateCompressedDimensions(1280, 720, 1920);

      expect(result).toEqual({ width: 1280, height: 720 });
    });

    it('should scale down width when exceeding max', () => {
      const result = CameraService.calculateCompressedDimensions(3840, 2160, 1920);

      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
    });

    it('should scale down height when exceeding max', () => {
      const result = CameraService.calculateCompressedDimensions(1080, 1920, 1440);

      expect(result.width).toBe(810);
      expect(result.height).toBe(1440);
    });

    it('should maintain aspect ratio', () => {
      const originalAspect = 16 / 9;
      const result = CameraService.calculateCompressedDimensions(3840, 2160, 1920);
      const newAspect = result.width / result.height;

      expect(Math.abs(newAspect - originalAspect)).toBeLessThan(0.01);
    });
  });
});
