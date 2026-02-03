import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TariffConfigurationEditor } from './TariffConfigurationEditor';
import { TariffConfigurationService, TariffType } from '../services/TariffConfigurationService';

describe('TariffConfigurationEditor', () => {
  beforeEach(() => {
    TariffConfigurationService.clear();
  });

  it('should render create form by default', () => {
    render(
      <TariffConfigurationEditor buildingId="building-1" />
    );

    expect(screen.getByText('Create Tariff')).toBeTruthy();
  });

  it('should render edit form when tariffId provided', () => {
    const tariff = TariffConfigurationService.createTariff(
      'building-1',
      'Test Tariff',
      TariffType.FIXED,
      1.5,
      10
    );

    render(
      <TariffConfigurationEditor
        buildingId="building-1"
        tariffId={tariff.id}
      />
    );

    expect(screen.getByText('Edit Tariff')).toBeTruthy();
  });

  it('should load tariff data when editing', async () => {
    const tariff = TariffConfigurationService.createTariff(
      'building-1',
      'Existing Tariff',
      TariffType.FIXED,
      2.5,
      15
    );

    const { container } = render(
      <TariffConfigurationEditor
        buildingId="building-1"
        tariffId={tariff.id}
      />
    );

    await waitFor(() => {
      const inputs = container.querySelectorAll('input[type="text"]');
      const nameInput = Array.from(inputs).find(
        (input) => (input as HTMLInputElement).placeholder === ''
      ) as HTMLInputElement | undefined;
      expect(nameInput?.value).toBe('Existing Tariff');
    });
  });

  it('should validate required fields', async () => {
    const { container } = render(
      <TariffConfigurationEditor buildingId="building-1" />
    );

    const saveButton = screen.getByText('Save Tariff');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeTruthy();
    });
  });

  it('should handle fixed rate tariff creation', async () => {
    const onSave = jest.fn();

    const { container } = render(
      <TariffConfigurationEditor
        buildingId="building-1"
        onSave={onSave}
      />
    );

    const inputs = container.querySelectorAll('input');
    const nameInput = Array.from(inputs).find(
      (input) => (input as HTMLInputElement).type === 'text'
    ) as HTMLInputElement;
    const rateInput = Array.from(inputs).find(
      (input) => (input as HTMLInputElement).placeholder === '0.00'
    ) as HTMLInputElement;

    if (nameInput) {
      fireEvent.change(nameInput, { target: { value: 'Test Rate' } });
    }
    if (rateInput) {
      fireEvent.change(rateInput, { target: { value: '1.5' } });
    }

    const saveButton = screen.getByText('Save Tariff');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSave).toHaveBeenCalled();
    });
  });

  it('should handle progressive rate tariff', async () => {
    const onSave = jest.fn();

    const { container } = render(
      <TariffConfigurationEditor
        buildingId="building-1"
        onSave={onSave}
      />
    );

    const select = container.querySelector('select');
    if (select) {
      fireEvent.change(select, { target: { value: TariffType.PROGRESSIVE } });
    }

    await waitFor(() => {
      expect(screen.getByText(/Add Progressive Rate/)).toBeTruthy();
    });
  });

  it('should allow adding progressive rates', async () => {
    const { container } = render(
      <TariffConfigurationEditor buildingId="building-1" />
    );

    const select = container.querySelector('select');
    if (select) {
      fireEvent.change(select, { target: { value: TariffType.PROGRESSIVE } });
    }

    await waitFor(() => {
      const inputs = container.querySelectorAll('input');
      const minInput = Array.from(inputs).find(
        (input) => (input as HTMLInputElement).placeholder === 'Min Index'
      ) as HTMLInputElement;
      const maxInput = Array.from(inputs).find(
        (input) => (input as HTMLInputElement).placeholder === 'Max Index'
      ) as HTMLInputElement;
      const rateInput = Array.from(inputs).find(
        (input) => (input as HTMLInputElement).placeholder === 'Rate per Unit'
      ) as HTMLInputElement;

      if (minInput && maxInput && rateInput) {
        fireEvent.change(minInput, { target: { value: '0' } });
        fireEvent.change(maxInput, { target: { value: '100' } });
        fireEvent.change(rateInput, { target: { value: '1.5' } });

        const addButton = screen.getByText('Add Rate');
        fireEvent.click(addButton);
      }
    });
  });

  it('should call onCancel when cancel button clicked', () => {
    const onCancel = jest.fn();

    render(
      <TariffConfigurationEditor
        buildingId="building-1"
        onCancel={onCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalled();
  });

  it('should display tax percentage field', () => {
    const { container } = render(
      <TariffConfigurationEditor buildingId="building-1" />
    );

    expect(screen.getByText('Tax Percentage *')).toBeTruthy();
  });

  it('should allow optional minimum charge', async () => {
    const { container } = render(
      <TariffConfigurationEditor buildingId="building-1" />
    );

    expect(screen.getByText('Minimum Charge (optional)')).toBeTruthy();
  });

  it('should allow optional maximum charge', async () => {
    const { container } = render(
      <TariffConfigurationEditor buildingId="building-1" />
    );

    expect(screen.getByText('Maximum Charge (optional)')).toBeTruthy();
  });
});
