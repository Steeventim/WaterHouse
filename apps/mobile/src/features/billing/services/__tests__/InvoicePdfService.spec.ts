/**
 * Tests for InvoicePdfService - Story 5.3
 */

import { InvoicePdfService, InvoiceData } from '../InvoicePdfService';

describe('InvoicePdfService - Template', () => {
  const baseInvoice: InvoiceData = {
    invoiceId: 'inv-001',
    buildingId: 'building-1',
    meterCode: 'METER-001',
    period: {
      start: new Date('2026-01-01T00:00:00Z').getTime(),
      end: new Date('2026-01-31T23:59:59Z').getTime(),
    },
    readings: {
      previousIndex: 1200,
      currentIndex: 1350,
      consumption: 150,
    },
    amounts: {
      baseCost: 4500,
      taxAmount: 900,
      totalCost: 5400,
      currency: 'XAF',
    },
    generatedAt: new Date('2026-02-01T08:00:00Z').getTime(),
    paymentLink: 'https://pay.example.com/invoices/inv-001',
  };

  it('should build invoice template with required fields', () => {
    const html = InvoicePdfService.buildInvoiceTemplate(baseInvoice);

    expect(html).toContain('Facture');
    expect(html).toContain('METER-001');
    expect(html).toContain('1200');
    expect(html).toContain('1350');
    expect(html).toContain('150');
    expect(html).toContain('5400');
    expect(html).toContain('XAF');
    expect(html).toContain('https://pay.example.com/invoices/inv-001');
  });

  it('should include period start and end in template', () => {
    const html = InvoicePdfService.buildInvoiceTemplate(baseInvoice);

    expect(html).toContain('2026');
    expect(html).toContain('01');
  });
});
