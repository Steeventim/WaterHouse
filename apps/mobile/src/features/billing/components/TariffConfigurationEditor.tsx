import React, { useState, useCallback } from 'react';
import {
  TariffConfigurationService,
  TariffConfiguration,
  TariffType,
} from '../services/TariffConfigurationService';

interface TariffEditorProps {
  buildingId: string;
  tariffId?: string;
  onSave?: (tariff: TariffConfiguration) => void;
  onCancel?: () => void;
}

export const TariffConfigurationEditor: React.FC<TariffEditorProps> = ({
  buildingId,
  tariffId,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<TariffType>(TariffType.FIXED);
  const [baseRate, setBaseRate] = useState('0');
  const [taxPercentage, setTaxPercentage] = useState('10');
  const [minimumCharge, setMinimumCharge] = useState('');
  const [maximumCharge, setMaximumCharge] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing tariff if editing
  React.useEffect(() => {
    if (tariffId) {
      const tariff = TariffConfigurationService.getTariff(tariffId);
      if (tariff) {
        setName(tariff.name);
        setType(tariff.type);
        setBaseRate(tariff.baseRate.toString());
        setTaxPercentage(tariff.taxPercentage.toString());
        setMinimumCharge(tariff.minimumCharge?.toString() || '');
        setMaximumCharge(tariff.maximumCharge?.toString() || '');
        setDescription(tariff.description || '');
      }
    }
  }, [tariffId]);

  const handleSave = useCallback(async () => {
    setErrors([]);
    setIsSaving(true);

    try {
      let tariff: TariffConfiguration;

      if (tariffId) {
        tariff = TariffConfigurationService.updateTariff(tariffId, {
          name,
          type,
          baseRate: parseFloat(baseRate),
          taxPercentage: parseFloat(taxPercentage),
          minimumCharge: minimumCharge ? parseFloat(minimumCharge) : undefined,
          maximumCharge: maximumCharge ? parseFloat(maximumCharge) : undefined,
          description,
        }) as TariffConfiguration;
      } else {
        tariff = TariffConfigurationService.createTariff(
          buildingId,
          name,
          type,
          parseFloat(baseRate),
          parseFloat(taxPercentage)
        );

        TariffConfigurationService.updateTariff(tariff.id, { description });
      }

      const validationErrors = TariffConfigurationService.validateTariff(tariff);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return;
      }

      if (onSave) {
        onSave(tariff);
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    tariffId,
    buildingId,
    name,
    type,
    baseRate,
    taxPercentage,
    minimumCharge,
    maximumCharge,
    description,
    onSave,
  ]);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        {tariffId ? 'Edit Tariff' : 'Create Tariff'}
      </h2>

      {errors.length > 0 && (
        <div style={{ marginBottom: 20, padding: '12px 16px', background: '#ffe0e0', borderRadius: 4 }}>
          {errors.map((error, idx) => (
            <p key={idx} style={{ margin: '4px 0', color: '#e63946' }}>
              • {error}
            </p>
          ))}
        </div>
      )}

      <div style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #e0e0e0' }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Basic Information</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            Tariff Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Standard Water Rate"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d0d0', borderRadius: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            Tariff Type *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as TariffType)}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d0d0', borderRadius: 4 }}
          >
            <option value={TariffType.FIXED}>Fixed Rate</option>
            <option value={TariffType.PROGRESSIVE}>Progressive</option>
            <option value={TariffType.TIERED}>Tiered</option>
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            Base Rate per Unit *
          </label>
          <input
            type="number"
            step="0.01"
            value={baseRate}
            onChange={(e) => setBaseRate(e.target.value)}
            placeholder="0.00"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d0d0', borderRadius: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            Tax Percentage *
          </label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={taxPercentage}
            onChange={(e) => setTaxPercentage(e.target.value)}
            placeholder="10"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d0d0', borderRadius: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            Minimum Charge (optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={minimumCharge}
            onChange={(e) => setMinimumCharge(e.target.value)}
            placeholder="0.00"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d0d0', borderRadius: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            Maximum Charge (optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={maximumCharge}
            onChange={(e) => setMaximumCharge(e.target.value)}
            placeholder="0.00"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d0d0', borderRadius: 4 }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the tariff..."
            rows={3}
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #d0d0d0', borderRadius: 4, fontFamily: 'inherit' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        <button
          style={{
            flex: 1,
            padding: '12px 24px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Tariff'}
        </button>
        {onCancel && (
          <button
            style={{
              padding: '12px 24px',
              background: '#f0f0f0',
              color: '#333',
              border: 'none',
              borderRadius: 4,
              fontWeight: 600,
              cursor: 'pointer',
            }}
            onClick={onCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};
