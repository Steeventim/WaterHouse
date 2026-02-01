/**
 * CameraScreen - Photo capture with preview and retake
 * Story 3.2: Capture photo obligatoire
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import { CameraService, PhotoMetadata } from '../services/CameraService';

interface CameraScreenProps {
  onPhotoCapture: (photo: PhotoMetadata) => void;
  onCancel: () => void;
  meterSerialNumber?: string;
}

export const CameraScreen: React.FC<CameraScreenProps> = ({
  onPhotoCapture,
  onCancel,
  meterSerialNumber,
}) => {
  const [capturedPhoto, setCapturedPhoto] = useState<PhotoMetadata | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  /**
   * Handle photo capture
   */
  const handleTakePhoto = async () => {
    try {
      setIsCapturing(true);

      // Check permissions
      const hasPermission = await CameraService.checkCameraPermission();
      if (!hasPermission) {
        const result = await CameraService.requestCameraPermission();
        if (!result.granted) {
          Alert.alert('Permission refusée', result.message || 'La caméra est requise pour prendre des photos.');
          setIsCapturing(false);
          return;
        }
      }

      // Simulate photo capture (in real app, use react-native-camera)
      // For now, create mock photo metadata
      const mockPhoto: PhotoMetadata = {
        uri: `file:///storage/photos/meter_${Date.now()}.jpg`,
        width: 1920,
        height: 1080,
        fileSize: 2 * 1024 * 1024, // 2MB
        timestamp: new Date().toISOString(),
      };

      // Validate photo
      const validation = CameraService.validatePhoto(mockPhoto);
      if (!validation.valid) {
        Alert.alert(
          'Photo invalide',
          validation.errors.join('\n'),
          [{ text: 'Réessayer' }]
        );
        setIsCapturing(false);
        return;
      }

      setCapturedPhoto(mockPhoto);
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo. Veuillez réessayer.');
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Confirm and use photo
   */
  const handleConfirmPhoto = () => {
    if (capturedPhoto) {
      onPhotoCapture(capturedPhoto);
    }
  };

  /**
   * Retake photo
   */
  const handleRetakePhoto = () => {
    setCapturedPhoto(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Capture photo du compteur</Text>
        {meterSerialNumber && (
          <Text style={styles.headerSubtitle}>N° {meterSerialNumber}</Text>
        )}
      </View>

      {/* Camera/Preview View */}
      <View style={styles.cameraContainer}>
        {capturedPhoto ? (
          // Preview captured photo
          <Image
            source={{ uri: capturedPhoto.uri }}
            style={styles.preview}
            resizeMode="contain"
          />
        ) : (
          // Camera view placeholder
          <View style={styles.cameraPlaceholder}>
            <Text style={styles.placeholderText}>📷</Text>
            <Text style={styles.instructionText}>
              Positionnez le compteur dans le cadre
            </Text>
            <Text style={styles.instructionSubtext}>
              Assurez-vous que les chiffres sont lisibles
            </Text>
          </View>
        )}

        {/* Capture guide overlay */}
        {!capturedPhoto && (
          <View style={styles.guideOverlay}>
            <View style={styles.guideFrame} />
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {capturedPhoto ? (
          // Photo preview actions
          <>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleRetakePhoto}
            >
              <Text style={styles.secondaryButtonText}>↺ Reprendre</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleConfirmPhoto}
            >
              <Text style={styles.primaryButtonText}>✓ Valider</Text>
            </TouchableOpacity>
          </>
        ) : (
          // Camera actions
          <>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={onCancel}
            >
              <Text style={styles.secondaryButtonText}>✕ Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.captureButton]}
              onPress={handleTakePhoto}
              disabled={isCapturing}
            >
              {isCapturing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.captureButtonText}>📷 Capturer</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Conseils :</Text>
        <Text style={styles.tipText}>• Assurez-vous que les chiffres sont nets</Text>
        <Text style={styles.tipText}>• Évitez les reflets sur le cadran</Text>
        <Text style={styles.tipText}>• Prenez la photo en pleine lumière</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginTop: 4,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  cameraPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#222',
  },
  placeholderText: {
    fontSize: 80,
    marginBottom: 24,
  },
  instructionText: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
  },
  preview: {
    flex: 1,
    width: '100%',
  },
  guideOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: '80%',
    height: '60%',
    borderWidth: 3,
    borderColor: '#4caf50',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#4caf50',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#555',
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  captureButton: {
    backgroundColor: '#2196F3',
  },
  captureButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tipsContainer: {
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffc107',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: '#ccc',
    marginBottom: 4,
  },
});
