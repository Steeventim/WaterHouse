import React, { useState } from 'react';
import { ConsumptionCalculationService, ConsumptionCalculationDetails } from '../services/ConsumptionCalculationService';
import { TariffConfiguration, TariffType } from '../services/TariffConfigurationService';

interface ConsumptionCalculationDisplayProps {
  calculationId: string;
}

export const ConsumptionCalculationDisplay: React.FC<ConsumptionCalculationDisplayProps> = ({
  calculationId,
}) => {
  const [calculation, setCalculation] = useState<ConsumptionCalculationDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const calc = ConsumptionCalculationService.getCalculation(calculationId);
    if (!calc) {
      setError('Calculation not found');
      return;
    }

    // In a real app, we'd fetch the tariff details separately
    // For now, we'll reconstruct a minimal version
    const details: ConsumptionCalculationDetails = {
      calculation: calc,
      tariff: {
        id: calc.tariffId,
        buildingId: calc.buildingId,
        name: `Tariff for ${calc.meterCode}`,
        type: TariffType.FIXED,
        baseRate: calc.baseCost / calc.consumption,
        currency: 'EUR',
        taxPercentage: (calc.taxAmount / calc.baseCost) * 100,
        isActive: true,
        createdAt: 0,
        updatedAt: 0,
      } as TariffConfiguration,
      audit: {
        formula: `${calc.currentIndex} - ${calc.previousIndex} = ${calc.consumption} units × rate`,
        variables: {
          previousIndex: calc.previousIndex,
          currentIndex: calc.currentIndex,
          consumption: calc.consumption,
          baseCost: calc.baseCost,
          taxAmount: calc.taxAmount,
          totalCost: calc.totalCost,
        },
      },
    };

    setCalculation(details);
  }, [calculationId]);

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div style={{ padding: 20, background: '#ffe0e0', borderRadius: 8 }}>
        <p style={{ color: '#e63946' }}>Error: {error}</p>
      </div>
    );
  }

  if (!calculation) {
    return <div style={{ padding: 20 }}>Loading calculation...</div>;
  }

  const { calculation: calc, tariff, breakdownByTier, audit } = calculation;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Consumption Calculation
      </h2>

      {/* Overview Section */}
      <div
        style={{
          background: '#f9f9f9',
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
          border: '1px solid #e0e0e0',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
              Meter Code
            </label>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '4px 0 0 0' }}>
              {calc.meterCode}
            </p>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
              Billing Period
            </label>
            <p style={{ fontSize: 14, color: '#333', margin: '4px 0 0 0' }}>
              {formatDate(calc.billingPeriodStart)} to {formatDate(calc.billingPeriodEnd)}
            </p>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
              Previous Index
            </label>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '4px 0 0 0' }}>
              {calc.previousIndex}
            </p>
          </div>

          <div>
            <label style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
              Current Index
            </label>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#333', margin: '4px 0 0 0' }}>
              {calc.currentIndex}
            </p>
          </div>
        </div>
      </div>

      {/* Consumption Section */}
      <div
        style={{
          background: '#f0f9ff',
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
          border: '1px solid #a6d4ff',
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Consumption</h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16, background: 'white', borderRadius: 8 }}>
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px 0' }}>Total Consumption</p>
            <p style={{ fontSize: 32, fontWeight: 700, color: '#007aff', margin: 0 }}>
              {calc.consumption}
            </p>
            <p style={{ fontSize: 12, color: '#999', margin: '8px 0 0 0' }}>units</p>
          </div>

          <div style={{ textAlign: 'center', padding: 16, background: 'white', borderRadius: 8 }}>
            <p style={{ fontSize: 12, color: '#666', margin: '0 0 8px 0' }}>
              Average Rate
            </p>
            <p style={{ fontSize: 32, fontWeight: 700, color: '#007aff', margin: 0 }}>
              {(calc.baseCost / calc.consumption).toFixed(3)}
            </p>
            <p style={{ fontSize: 12, color: '#999', margin: '8px 0 0 0' }}>€/unit</p>
          </div>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div
        style={{
          background: 'white',
          borderRadius: 8,
          padding: 20,
          marginBottom: 24,
          border: '1px solid #e0e0e0',
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Cost Breakdown</h3>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 0', color: '#666' }}>Base Cost</td>
              <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: '#333' }}>
                €{calc.baseCost.toFixed(2)}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '12px 0', color: '#666' }}>
                Tax ({tariff.taxPercentage.toFixed(1)}%)
              </td>
              <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 600, color: '#333' }}>
                €{calc.taxAmount.toFixed(2)}
              </td>
            </tr>
            <tr style={{ background: '#f9f9f9' }}>
              <td style={{ padding: '12px 0', color: '#333', fontWeight: 600 }}>Total Cost</td>
              <td
                style={{
                  padding: '12px 0',
                  textAlign: 'right',
                  fontWeight: 700,
                  color: '#007aff',
                  fontSize: 16,
                }}
              >
                €{calc.totalCost.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tier Breakdown */}
      {breakdownByTier && breakdownByTier.length > 0 && (
        <div
          style={{
            background: 'white',
            borderRadius: 8,
            padding: 20,
            marginBottom: 24,
            border: '1px solid #e0e0e0',
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Tiered Breakdown</h3>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0', background: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#666', fontWeight: 600 }}>
                  Tier Range
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'right',
                    color: '#666',
                    fontWeight: 600,
                  }}
                >
                  Consumption
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'right',
                    color: '#666',
                    fontWeight: 600,
                  }}
                >
                  Rate
                </th>
                <th
                  style={{
                    padding: '12px',
                    textAlign: 'right',
                    color: '#666',
                    fontWeight: 600,
                  }}
                >
                  Cost
                </th>
              </tr>
            </thead>
            <tbody>
              {breakdownByTier.map((tier, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid #f0f0f0',
                    background: idx % 2 === 0 ? '#fafafa' : 'white',
                  }}
                >
                  <td style={{ padding: '12px', color: '#333' }}>
                    {tier.tierMin} - {tier.tierMax}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#333' }}>
                    {tier.tierConsumption} units
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#333' }}>
                    €{tier.ratePerUnit.toFixed(4)}
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'right',
                      fontWeight: 600,
                      color: '#333',
                    }}
                  >
                    €{tier.tierCost.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Trail */}
      <div
        style={{
          background: '#fffbf0',
          borderRadius: 8,
          padding: 20,
          border: '1px solid #ffe0b2',
        }}
      >
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Calculation Audit</h3>

        <div style={{ background: 'white', padding: 12, borderRadius: 4, marginBottom: 16 }}>
          <code
            style={{
              fontSize: 13,
              color: '#555',
              fontFamily: 'monospace',
              wordBreak: 'break-all',
            }}
          >
            {audit.formula}
          </code>
        </div>

        <div>
          <p style={{ fontSize: 13, color: '#666', fontWeight: 500, marginBottom: 8 }}>
            Variables:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {Object.entries(audit.variables).map(([key, value]) => (
              <li
                key={key}
                style={{ fontSize: 12, color: '#555', margin: '4px 0', fontFamily: 'monospace' }}
              >
                {key} = {typeof value === 'number' ? value.toFixed(2) : value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
