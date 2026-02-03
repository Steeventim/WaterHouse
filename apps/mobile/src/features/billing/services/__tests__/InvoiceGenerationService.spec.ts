/**
 * Tests for InvoiceGenerationService - Story 5.3
 */

import type { InvoiceData } from '../InvoicePdfService';

jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
  unlink: jest.fn(),
  stat: jest.fn(),
}));

const RNFS = require('react-native-fs') as {
  DocumentDirectoryPath: string;
  exists: jest.Mock;
  mkdir: jest.Mock;
  writeFile: jest.Mock;
  readFile: jest.Mock;
  unlink: jest.Mock;
  stat: jest.Mock;
};

const { InvoiceGenerationService } = require('../InvoiceGenerationService') as typeof import('../InvoiceGenerationService');

describe('InvoiceGenerationService', () => {
  const invoice: InvoiceData = {
    invoiceId: 'inv-100',
    buildingId: 'building-1',
    meterCode: 'METER-010',
    period: {
      start: new Date('2026-01-01T00:00:00Z').getTime(),
      end: new Date('2026-01-31T23:59:59Z').getTime(),
    },
    readings: {
      previousIndex: 500,
      currentIndex: 620,
      consumption: 120,
    },
    amounts: {
      baseCost: 3600,
      taxAmount: 720,
      totalCost: 4320,
      currency: 'XAF',
    },
    generatedAt: new Date('2026-02-01T08:00:00Z').getTime(),
    paymentLink: 'https://pay.example.com/invoices/inv-100',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    InvoiceGenerationService.clear();
  });

  it('should generate invoice PDF and link', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.readFile as jest.Mock).mockResolvedValue('[]');
    (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
    (RNFS.stat as jest.Mock).mockResolvedValue({ size: 1200 });

    const result = await InvoiceGenerationService.generateInvoicePdf(invoice);

    expect(result.invoiceId).toBe('inv-100');
    expect(result.pdf.filePath).toContain('/mock/documents/invoices');
    expect(result.accessLink.url).toContain('token=');
  });

  it('should generate bulk invoices', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.readFile as jest.Mock).mockResolvedValue('[]');
    (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
    (RNFS.stat as jest.Mock).mockResolvedValue({ size: 1200 });

    const result = await InvoiceGenerationService.generateBulk([invoice, {
      ...invoice,
      invoiceId: 'inv-101',
    }]);

    expect(result).toHaveLength(2);
  });
});
