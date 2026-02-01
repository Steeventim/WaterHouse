/**
 * ValidatedInput - Real-time validated input component
 * Story 3.3: Validation en temps réel
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  ReadingValidator,
  ValidationContext,
  ReadingValidationResult,
} from '../services/ReadingValidator';

interface ValidatedInputProps {
  value: string;
  onValueChange: (value: string) => void;
  onValidationChange?: (result: ReadingValidationResult) => void;
  context: ValidationContext;
  placeholder?: string;
  editable?: boolean;
  showValidationFeedback?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  value,
  onValueChange,
  onValidationChange,
  context,
  placeholder = 'Saisir l\'index',
  editable = true,
  showValidationFeedback = true,
}) => {
  const [validationResult, setValidationResult] = useState<ReadingValidationResult>({
    valid: true,
    errors: [],
    warnings: [],
    infos: [],
    canSubmit: false,
    requiresComment: false,
  });
  const [isValidating, setIsValidating] = useState(false);

  // Validate input in real-time
  useEffect(() => {
    const validateAsync = async () => {
      setIsValidating(true);
      const result = ReadingValidator.validateReading(value, context);
      setValidationResult(result);
      onValidationChange?.(result);
      setIsValidating(false);
    };

    // Debounce validation
    const timer = setTimeout(validateAsync, 300);
    return () => clearTimeout(timer);
  }, [value, context]);

  const statusColor = ReadingValidator.getStatusColor(validationResult);
  const statusIcon = ReadingValidator.getStatusIcon(validationResult);

  return (
    <View style={styles.container}>
      {/* Input field with validation indicator */}
      <View style={[styles.inputWrapper, { borderColor: statusColor }]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onValueChange}
          placeholder={placeholder}
          keyboardType="decimal-pad"
          editable={editable}
          maxLength={12}
          placeholderTextColor="#999"
        />

        {/* Validation status indicator */}
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]}>
          {isValidating ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.statusIcon}>{statusIcon}</Text>
          )}
        </View>
      </View>

      {/* Validation feedback */}
      {showValidationFeedback && value && (
        <View style={styles.feedbackContainer}>
          {/* Info messages */}
          {validationResult.infos.length > 0 && (
            <View style={styles.feedbackSection}>
              {validationResult.infos.map((info, i) => (
                <View key={`info-${i}`} style={styles.infoMessage}>
                  <Text style={styles.infoIcon}>ℹ</Text>
                  <Text style={styles.infoText}>{info.message}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Warning messages */}
          {validationResult.warnings.length > 0 && (
            <View style={styles.feedbackSection}>
              {validationResult.warnings.map((warning, i) => (
                <View key={`warning-${i}`} style={styles.warningMessage}>
                  <Text style={styles.warningIcon}>⚠</Text>
                  <Text style={styles.warningText}>{warning.message}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Error messages */}
          {validationResult.errors.length > 0 && (
            <View style={styles.feedbackSection}>
              {validationResult.errors.map((error, i) => (
                <View key={`error-${i}`} style={styles.errorMessage}>
                  <Text style={styles.errorIcon}>✕</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.errorText}>{error.message}</Text>
                    {error.canOverride && (
                      <Text style={styles.overrideHint}>
                        Vous pouvez forcer avec un commentaire
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Quick actions */}
      {value && validationResult.valid && (
        <TouchableOpacity style={styles.clearButton} onPress={() => onValueChange('')}>
          <Text style={styles.clearButtonText}>Effacer</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingRight: 12,
    backgroundColor: '#fff',
    minHeight: 56,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontWeight: 'bold',
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: '#333',
  },
  statusIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  feedbackContainer: {
    marginTop: 12,
    gap: 8,
  },
  feedbackSection: {
    gap: 8,
  },
  infoMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#e3f2fd',
    gap: 8,
  },
  infoIcon: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: 'bold',
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1565c0',
    lineHeight: 18,
  },
  warningMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff3e0',
    gap: 8,
  },
  warningIcon: {
    fontSize: 16,
    color: '#ff9800',
    fontWeight: 'bold',
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#e65100',
    lineHeight: 18,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffebee',
    gap: 8,
  },
  errorIcon: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: 'bold',
    marginTop: 2,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    color: '#c62828',
    lineHeight: 18,
    fontWeight: '600',
  },
  overrideHint: {
    fontSize: 11,
    color: '#d32f2f',
    marginTop: 4,
    fontStyle: 'italic',
  },
  clearButton: {
    marginTop: 8,
    padding: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'underline',
  },
});
