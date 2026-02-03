/**
 * ConflictResolutionModal - UI for resolving sync conflicts
 * Story 4.2: Résolution manuelle des conflits
 * Side-by-side comparison with resolution options
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import {
  ReadingConflict,
  ConflictResolution,
  ConflictType,
} from '../services/ConflictDetectionService';

export interface ConflictResolutionModalProps {
  conflict: ReadingConflict | null;
  visible: boolean;
  onResolve: (resolution: ConflictResolution, notes?: string) => void;
  onCancel: () => void;
}

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  conflict,
  visible,
  onResolve,
  onCancel,
}) => {
  const [selectedResolution, setSelectedResolution] = useState<ConflictResolution | null>(null);
  const [notes, setNotes] = useState('');

  if (!conflict) {
    return null;
  }

  const handleResolve = () => {
    if (!selectedResolution) return;
    onResolve(selectedResolution, notes || undefined);
    setSelectedResolution(null);
    setNotes('');
  };

  const getConflictTypeLabel = () => {
    switch (conflict.conflictType) {
      case ConflictType.DUPLICATE:
        return 'Relevé en double';
      case ConflictType.NEWER_REMOTE:
        return 'Relevé distant plus récent';
      case ConflictType.DIFFERENT_VALUE:
        return 'Valeurs différentes';
      default:
        return 'Conflit';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Conflit de synchronisation</Text>
            <Text style={styles.subtitle}>{getConflictTypeLabel()}</Text>
          </View>

          <ScrollView style={styles.content}>
            {/* Meter Info */}
            <View style={styles.meterInfo}>
              <Text style={styles.meterLabel}>Compteur:</Text>
              <Text style={styles.meterValue}>{conflict.meterId}</Text>
            </View>

            {/* Comparison */}
            <View style={styles.comparison}>
              {/* Local Reading */}
              <View style={styles.readingCard}>
                <View style={[styles.cardHeader, { backgroundColor: '#2196F3' }]}>
                  <Text style={styles.cardTitle}>📱 Version Locale</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.readingRow}>
                    <Text style={styles.label}>Index:</Text>
                    <Text style={styles.value}>{conflict.localReading.reading}</Text>
                  </View>
                  <View style={styles.readingRow}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.valueSmall}>
                      {formatDate(conflict.localReading.timestamp)}
                    </Text>
                  </View>
                  {conflict.localReading.photoPath && (
                    <View style={styles.readingRow}>
                      <Text style={styles.label}>Photo:</Text>
                      <Text style={styles.valueSmall}>✓ Disponible</Text>
                    </View>
                  )}
                  {conflict.localReading.overrideComment && (
                    <View style={styles.readingRow}>
                      <Text style={styles.label}>Note:</Text>
                      <Text style={styles.valueSmall}>
                        {conflict.localReading.overrideComment}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Remote Reading */}
              <View style={styles.readingCard}>
                <View style={[styles.cardHeader, { backgroundColor: '#ff9800' }]}>
                  <Text style={styles.cardTitle}>☁️ Version Distante</Text>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.readingRow}>
                    <Text style={styles.label}>Index:</Text>
                    <Text style={styles.value}>{conflict.remoteReading.reading}</Text>
                  </View>
                  <View style={styles.readingRow}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.valueSmall}>
                      {formatDate(conflict.remoteReading.timestamp)}
                    </Text>
                  </View>
                  {conflict.remoteReading.photoUrl && (
                    <View style={styles.readingRow}>
                      <Text style={styles.label}>Photo:</Text>
                      <Text style={styles.valueSmall}>✓ Disponible</Text>
                    </View>
                  )}
                  {conflict.remoteReading.syncedBy && (
                    <View style={styles.readingRow}>
                      <Text style={styles.label}>Par:</Text>
                      <Text style={styles.valueSmall}>
                        {conflict.remoteReading.syncedBy}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Resolution Options */}
            <View style={styles.resolutionOptions}>
              <Text style={styles.sectionTitle}>Choisir une résolution:</Text>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedResolution === ConflictResolution.KEEP_LOCAL && styles.optionSelected,
                ]}
                onPress={() => setSelectedResolution(ConflictResolution.KEEP_LOCAL)}
              >
                <Text style={styles.optionIcon}>📱</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Garder la version locale</Text>
                  <Text style={styles.optionDesc}>
                    Utiliser le relevé effectué sur cet appareil
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedResolution === ConflictResolution.KEEP_REMOTE && styles.optionSelected,
                ]}
                onPress={() => setSelectedResolution(ConflictResolution.KEEP_REMOTE)}
              >
                <Text style={styles.optionIcon}>☁️</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Garder la version distante</Text>
                  <Text style={styles.optionDesc}>
                    Utiliser le relevé synchronisé depuis le serveur
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  selectedResolution === ConflictResolution.SKIP && styles.optionSelected,
                ]}
                onPress={() => setSelectedResolution(ConflictResolution.SKIP)}
              >
                <Text style={styles.optionIcon}>⏭</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionTitle}>Ignorer ce conflit</Text>
                  <Text style={styles.optionDesc}>
                    Reporter la décision à plus tard
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Notes */}
            {selectedResolution && (
              <View style={styles.notesSection}>
                <Text style={styles.sectionTitle}>Notes (optionnel):</Text>
                <TextInput
                  style={styles.notesInput}
                  placeholder="Ajouter une explication pour la piste d'audit..."
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                  maxLength={500}
                />
                <Text style={styles.charCount}>{notes.length}/500</Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.resolveButton, !selectedResolution && styles.buttonDisabled]}
              onPress={handleResolve}
              disabled={!selectedResolution}
            >
              <Text style={styles.resolveText}>Résoudre</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    backgroundColor: '#f44336',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  meterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 16,
  },
  meterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginRight: 8,
  },
  meterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  comparison: {
    gap: 12,
    marginBottom: 20,
  },
  readingCard: {
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardHeader: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  cardBody: {
    padding: 12,
    gap: 10,
  },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  valueSmall: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  resolutionOptions: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  optionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#e3f2fd',
  },
  optionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    color: '#757575',
  },
  notesSection: {
    marginBottom: 16,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#757575',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resolveButton: {
    flex: 1,
    padding: 14,
    backgroundColor: '#4caf50',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#bdbdbd',
  },
  resolveText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ConflictResolutionModal;
