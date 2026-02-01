/**
 * MeterReadingScreen - Meter reading entry with mandatory photo
 * Story 3.2: Capture photo obligatoire
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Text,
  ActivityIndicator,
} from 'react-native';
import { CameraScreen } from './CameraScreen';
import { PhotoMetadata } from '../services/CameraService';
import { PhotoStorage, StoredPhoto } from '../services/PhotoStorage';
import { Meter } from '../../../common/types/sync.types';

interface MeterReadingScreenProps {
  meter: Meter;
  onSave: (reading: MeterReading) => void;
  onCancel: () => void;
}

export interface MeterReading {
  meterId: string;
  currentValue: number;
  photoId: string;
  photo: StoredPhoto;
  notes?: string;
  timestamp: string;
}

export const MeterReadingScreen: React.FC<MeterReadingScreenProps> = ({
  meter,
  onSave,
  onCancel,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<StoredPhoto | null>(null);
  const [readingValue, setReadingValue] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Handle photo capture from camera
   */
  const handlePhotoCapture = async (photo: PhotoMetadata) => {
    try {
      // Save photo to secure storage
      const storedPhoto = await PhotoStorage.savePhoto(photo, meter.id);
      setCapturedPhoto(storedPhoto);
      setShowCamera(false);
    } catch (error) {
      console.error('Failed to store photo:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la photo. Veuillez réessayer.');
    }
  };

  /**
   * Remove captured photo
   */
  const handleRemovePhoto = async () => {
    if (!capturedPhoto) return;

    Alert.alert(
      'Supprimer la photo',
      'Êtes-vous sûr de vouloir supprimer cette photo ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await PhotoStorage.deletePhoto(capturedPhoto.id);
            setCapturedPhoto(null);
          },
        },
      ]
    );
  };

  /**
   * Validate reading before save
   */
  const validateReading = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Photo is mandatory
    if (!capturedPhoto) {
      errors.push('La photo du compteur est obligatoire');
    }

    // Reading value is required
    const value = parseFloat(readingValue);
    if (!readingValue || isNaN(value)) {
      errors.push('Veuillez saisir un index valide');
    }

    // Check if reading is lower than previous
    if (value < meter.initialReading) {
      errors.push(
        `L'index saisi (${value}) est inférieur à l'index précédent (${meter.initialReading})`
      );
    }

    // Warning for large increase (but not blocking)
    const consumption = value - meter.initialReading;
    if (consumption > 1000) {
      Alert.alert(
        'Consommation élevée',
        `La consommation calculée est de ${consumption} unités. Veuillez vérifier l'index saisi.`,
        [
          { text: 'Modifier', style: 'cancel' },
          {
            text: 'Confirmer',
            onPress: () => handleSaveReading(),
          },
        ]
      );
      return { valid: false, errors: [] };
    }

    return { valid: errors.length === 0, errors };
  };

  /**
   * Save reading with photo
   */
  const handleSaveReading = async () => {
    const validation = validateReading();
    if (!validation.valid) {
      Alert.alert('Validation échouée', validation.errors.join('\n'));
      return;
    }

    if (!capturedPhoto) return;

    try {
      setIsSaving(true);

      const reading: MeterReading = {
        meterId: meter.id,
        currentValue: parseFloat(readingValue),
        photoId: capturedPhoto.id,
        photo: capturedPhoto,
        notes: notes.trim() || undefined,
        timestamp: new Date().toISOString(),
      };

      onSave(reading);
    } catch (error) {
      console.error('Failed to save reading:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le relevé. Veuillez réessayer.');
    } finally {
      setIsSaving(false);
    }
  };

  if (showCamera) {
    return (
      <CameraScreen
        onPhotoCapture={handlePhotoCapture}
        onCancel={() => setShowCamera(false)}
        meterSerialNumber={meter.serialNumber}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Relevé de compteur</Text>
        <Text style={styles.headerSubtitle}>N° {meter.serialNumber}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Photo Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            📷 Photo du compteur <Text style={styles.required}>*</Text>
          </Text>

          {capturedPhoto ? (
            <View style={styles.photoContainer}>
              <Image
                source={{ uri: capturedPhoto.metadata.uri }}
                style={styles.photoPreview}
                resizeMode="cover"
              />
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={styles.photoActionButton}
                  onPress={() => setShowCamera(true)}
                >
                  <Text style={styles.photoActionText}>↺ Reprendre</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.photoActionButton, styles.photoActionDanger]}
                  onPress={handleRemovePhoto}
                >
                  <Text style={styles.photoActionText}>✕ Supprimer</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.photoInfo}>
                Photo prise le {new Date(capturedPhoto.createdAt).toLocaleString('fr-FR')}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.captureButton}
              onPress={() => setShowCamera(true)}
            >
              <Text style={styles.captureButtonIcon}>📷</Text>
              <Text style={styles.captureButtonText}>Prendre une photo</Text>
              <Text style={styles.captureButtonSubtext}>
                La photo est obligatoire pour valider le relevé
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Reading Value Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Index actuel <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.readingInput}
            value={readingValue}
            onChangeText={setReadingValue}
            placeholder="Saisir l'index"
            keyboardType="numeric"
            maxLength={10}
          />
          <Text style={styles.previousReading}>
            Index précédent : {meter.initialReading}
          </Text>
          {readingValue && !isNaN(parseFloat(readingValue)) && (
            <Text style={styles.consumption}>
              Consommation : {parseFloat(readingValue) - meter.initialReading} unités
            </Text>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Remarques (optionnel)</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ajouter des remarques..."
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isSaving}
        >
          <Text style={styles.cancelButtonText}>Annuler</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSaveReading}
          disabled={isSaving || !capturedPhoto || !readingValue}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>✓ Enregistrer</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  required: {
    color: '#f44336',
  },
  captureButton: {
    padding: 40,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  captureButtonIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  captureButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  captureButtonSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  photoActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  photoActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2196F3',
    alignItems: 'center',
  },
  photoActionDanger: {
    backgroundColor: '#f44336',
  },
  photoActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  photoInfo: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
  },
  readingInput: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  previousReading: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  consumption: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: '#4caf50',
    textAlign: 'center',
  },
  notesInput: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
