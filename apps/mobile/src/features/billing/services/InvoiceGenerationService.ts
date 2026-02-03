/**
 * InvoiceGenerationService - orchestrates invoice PDF generation and storage
 * Story 5.3: Génération de factures PDF
 */

import { InvoicePdfService, InvoiceData } from './InvoicePdfService';
import { InvoicePdfStorageService, StoredInvoicePdf, TempAccessLink } from './InvoicePdfStorageService';

export interface InvoicePdfResult {
  invoiceId: string;
  pdf: StoredInvoicePdf;
  accessLink: TempAccessLink;
}

export class InvoiceGenerationService {
  private static records: Map<string, InvoicePdfResult> = new Map();

  static async generateInvoicePdf(invoice: InvoiceData): Promise<InvoicePdfResult> {
    const html = InvoicePdfService.buildInvoiceTemplate(invoice);
    const stored = await InvoicePdfStorageService.savePdf(invoice.invoiceId, html, 30);
    const link = await InvoicePdfStorageService.getTempAccessLink(stored.id);

    if (!link) {
      throw new Error('Failed to generate access link');
    }

    const result: InvoicePdfResult = {
      invoiceId: invoice.invoiceId,
      pdf: stored,
      accessLink: link,
    };

    this.records.set(invoice.invoiceId, result);
    return result;
  }

  static async generateBulk(invoices: InvoiceData[]): Promise<InvoicePdfResult[]> {
    const results: InvoicePdfResult[] = [];
    for (const invoice of invoices) {
      results.push(await this.generateInvoicePdf(invoice));
    }
    return results;
  }

  static getInvoiceRecord(invoiceId: string): InvoicePdfResult | null {
    return this.records.get(invoiceId) ?? null;
  }

  static clear(): void {
    this.records.clear();
  }
}
