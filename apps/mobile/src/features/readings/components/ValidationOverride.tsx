/**
 * ValidationOverride - Override mechanism with audit trail
 * Story 3.3: Validation en temps réel
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';

export interface OverrideAuditEntry {
  id: string;
  readingValue: number;
  previousValue: number;
  reason: string;
  overrideReason: string;
  timestamp: string;
  userId?: string;
  authorizedBy?: string;
}

interface ValidationOverrideProps {
  visible: boolean;
  readingValue: number;
  previousValue: number;
  errorMessage: string;
  onConfirm: (comment: string) => void;
  onCancel: () => void;
}

export const ValidationOverride: React.FC<ValidationOverrideProps> = ({
  visible,
  readingValue,
  previousValue,
  errorMessage,
  onConfirm,
  onCancel,
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = () => {
    if (!comment.trim()) {
      Alert.alert(
        'Commentaire requis',
        'Un commentaire expliquant le forçage est obligatoire.'
      );
      return;
    }

    setIsSubmitting(true);
    // Simulate async operation
    setTimeout(() => {
      onConfirm(comment);
      setComment('');
      setIsSubmitting(false);
    }, 300);
  };

  const handleCancel = () => {
    setComment('');
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>⚠ Forcer la saisie</Text>
            <Text style={styles.subtitle}>Cet index requiert une justification</Text>
          </View>

          <ScrollView style={styles.content}>
            {/* Warning box */}
            <View style={styles.warningBox}>
              <Text style={styles.warningIcon}>⚠</Text>
              <View style={styles.warningContent}>
                <Text style={styles.warningTitle}>Attention</Text>
                <Text style={styles.warningMessage}>{errorMessage}</Text>
              </View>
            </View>

            {/* Values comparison */}
            <View style={styles.comparisonSection}>
              <Text style={styles.sectionTitle}>Comparaison des index</Text>

              <View style={styles.comparisonRow}>
                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>Précédent</Text>
                  <Text style={styles.comparisonValue}>{previousValue}</Text>
                </View>

                <Text style={styles.arrow}>→</Text>

                <View style={styles.comparisonItem}>
                  <Text style={styles.comparisonLabel}>Actuel</Text>
                  <Text style={[styles.comparisonValue, { color: '#f44336' }]}>
                    {readingValue}
                  </Text>
                </View>
              </View>

              <View style={styles.diffBox}>
                <Text style={styles.diffLabel}>Différence :</Text>
                <Text style={styles.diffValue}>
                  {readingValue - previousValue} unités
                </Text>
              </View>
            </View>

            {/* Comment input */}
            <View style={styles.commentSection}>
              <Text style={styles.sectionTitle}>
                Justification obligatoire <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.commentHint}>
                Veuillez expliquer pourquoi cet index est correct
                (ex: "Ancien compteur, aucune consommation", "Erreur de relevé précédent")
              </Text>

              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Saisir la justification..."
                multiline
                numberOfLines={4}
                editable={!isSubmitting}
                maxLength={500}
              />

              <Text style={styles.charCount}>
                {comment.length}/500 caractères
              </Text>
            </View>

            {/* Audit trail info */}
            <View style={styles.auditInfo}>
              <Text style={styles.auditTitle}>🔐 Audit & Traçabilité</Text>
              <Text style={styles.auditText}>
                Cette action sera enregistrée avec la date, l'heure et votre justification
                pour fins d'audit.
              </Text>
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { opacity: comment.trim().length === 0 ? 0.5 : 1 },
              ]}
              onPress={handleConfirm}
              disabled={isSubmitting || comment.trim().length === 0}
            >
              <Text style={styles.confirmButtonText}>
                {isSubmitting ? '...' : 'Forcer'}
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff3e0',
    borderBottomWidth: 1,
    borderBottomColor: '#ffe0b2',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e65100',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#bf360c',
  },
  content: {
    padding: 20,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffebee',
    marginBottom: 20,
    gap: 12,
  },
  warningIcon: {
    fontSize: 28,
    marginTop: 2,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 4,
  },
  warningMessage: {
    fontSize: 14,
    color: '#d32f2f',
    lineHeight: 20,
  },
  comparisonSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  comparisonItem: {
    alignItems: 'center',
    flex: 1,
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  arrow: {
    fontSize: 20,
    color: '#999',
    marginHorizontal: 16,
  },
  diffBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  diffLabel: {
    fontSize: 14,
    color: '#666',
  },
  diffValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f44336',
  },
  required: {
    color: '#f44336',
  },
  commentSection: {
    marginBottom: 20,
  },
  commentHint: {
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
  },
  auditInfo: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
    marginBottom: 20,
  },
  auditTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1b5e20',
    marginBottom: 4,
  },
  auditText: {
    fontSize: 12,
    color: '#2e7d32',
    lineHeight: 18,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    backgroundColor: '#ff9800',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
