/**
 * Camera service for photo capture with permission handling
 * Story 3.2: Capture photo obligatoire
 */

import { Platform, PermissionsAndroid } from 'react-native';

export interface CameraPermissionResult {
  granted: boolean;
  message?: string;
}

export interface PhotoMetadata {
  uri: string;
  width: number;
  height: number;
  fileSize: number;
  timestamp: string;
  latitude?: number;
  longitude?: number;
}

export class CameraService {
  /**
   * Request camera permission
   */
  static async requestCameraPermission(): Promise<CameraPermissionResult> {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Permission d\'accès à la caméra',
            message: 'WaterHouse a besoin d\'accéder à votre caméra pour prendre des photos des compteurs.',
            buttonNeutral: 'Plus tard',
            buttonNegative: 'Refuser',
            buttonPositive: 'Autoriser',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return { granted: true };
        } else {
          return {
            granted: false,
            message: 'Permission caméra refusée. Veuillez l\'activer dans les paramètres.',
          };
        }
      }

      // iOS - permissions handled by Info.plist
      return { granted: true };
    } catch (err) {
      console.error('Camera permission error:', err);
      return {
        granted: false,
        message: 'Erreur lors de la demande de permission caméra.',
      };
    }
  }

  /**
   * Check if camera permission is granted
   */
  static async checkCameraPermission(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        const result = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return result;
      }
      return true; // iOS permissions checked at runtime
    } catch (err) {
      console.error('Check camera permission error:', err);
      return false;
    }
  }

  /**
   * Request storage permission for saving photos
   */
  static async requestStoragePermission(): Promise<CameraPermissionResult> {
    try {
      if (Platform.OS === 'android' && Platform.Version < 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Permission de stockage',
            message: 'WaterHouse a besoin d\'accéder au stockage pour sauvegarder les photos.',
            buttonNeutral: 'Plus tard',
            buttonNegative: 'Refuser',
            buttonPositive: 'Autoriser',
          }
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return { granted: true };
        } else {
          return {
            granted: false,
            message: 'Permission stockage refusée.',
          };
        }
      }

      // Android 13+ doesn't need WRITE_EXTERNAL_STORAGE
      return { granted: true };
    } catch (err) {
      console.error('Storage permission error:', err);
      return {
        granted: false,
        message: 'Erreur lors de la demande de permission stockage.',
      };
    }
  }

  /**
   * Validate photo quality and size
   */
  static validatePhoto(metadata: PhotoMetadata): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check file size (max 10MB)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (metadata.fileSize > maxSizeBytes) {
      errors.push(`Photo trop volumineuse (max 10MB). Taille: ${(metadata.fileSize / 1024 / 1024).toFixed(1)}MB`);
    }

    // Check minimum dimensions
    const minWidth = 640;
    const minHeight = 480;
    if (metadata.width < minWidth || metadata.height < minHeight) {
      errors.push(`Résolution trop faible (min ${minWidth}x${minHeight}). Résolution: ${metadata.width}x${metadata.height}`);
    }

    // Check if file exists
    if (!metadata.uri || metadata.uri.length === 0) {
      errors.push('Photo invalide ou manquante');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate optimal photo dimensions for compression
   */
  static calculateCompressedDimensions(
    width: number,
    height: number,
    maxDimension = 1920
  ): { width: number; height: number } {
    if (width <= maxDimension && height <= maxDimension) {
      return { width, height };
    }

    const aspectRatio = width / height;
    if (width > height) {
      return {
        width: maxDimension,
        height: Math.round(maxDimension / aspectRatio),
      };
    } else {
      return {
        width: Math.round(maxDimension * aspectRatio),
        height: maxDimension,
      };
    }
  }
}
