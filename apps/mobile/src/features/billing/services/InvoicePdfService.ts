/**
 * InvoicePdfService - PDF invoice template and generation helpers
 * Story 5.3: Génération de factures PDF
 */

export interface InvoicePeriod {
  start: number;
  end: number;
}

export interface InvoiceReadings {
  previousIndex: number;
  currentIndex: number;
  consumption: number;
}

export interface InvoiceAmounts {
  baseCost: number;
  taxAmount: number;
  totalCost: number;
  currency: string;
}

export interface InvoiceRecipient {
  name?: string;
  unitName?: string;
  phone?: string;
}

export interface InvoiceData {
  invoiceId: string;
  buildingId: string;
  meterCode: string;
  period: InvoicePeriod;
  readings: InvoiceReadings;
  amounts: InvoiceAmounts;
  generatedAt: number;
  recipient?: InvoiceRecipient;
  paymentLink?: string;
}

export class InvoicePdfService {
  /**
   * Build HTML template for invoice PDF
   */
  static buildInvoiceTemplate(invoice: InvoiceData): string {
    const periodStart = this.formatDate(invoice.period.start);
    const periodEnd = this.formatDate(invoice.period.end);
    const generatedAt = this.formatDate(invoice.generatedAt);

    return `
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <title>Facture ${invoice.invoiceId}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 24px; }
      .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
      .title { font-size: 24px; font-weight: 700; }
      .badge { background: #e0f2fe; color: #0369a1; padding: 4px 10px; border-radius: 999px; font-size: 12px; }
      .section { margin-bottom: 20px; }
      .section h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #6b7280; margin-bottom: 8px; }
      .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
      .value { font-size: 16px; font-weight: 600; }
      .totals { font-size: 18px; font-weight: 700; color: #0f766e; }
      .footer { font-size: 12px; color: #6b7280; margin-top: 24px; }
      .link { color: #2563eb; text-decoration: none; }
    </style>
  </head>
  <body>
    <div class="header">
      <div>
        <div class="title">Facture WaterHouse</div>
        <div>Référence: ${invoice.invoiceId}</div>
      </div>
      <div class="badge">${invoice.amounts.currency}</div>
    </div>

    <div class="section">
      <h3>Période</h3>
      <div class="card">
        <div class="value">${periodStart} → ${periodEnd}</div>
        <div>Généré le ${generatedAt}</div>
      </div>
    </div>

    <div class="section">
      <h3>Compteur</h3>
      <div class="grid">
        <div class="card">Code compteur<br /><span class="value">${invoice.meterCode}</span></div>
        <div class="card">Consommation<br /><span class="value">${invoice.readings.consumption}</span></div>
        <div class="card">Index précédent<br /><span class="value">${invoice.readings.previousIndex}</span></div>
        <div class="card">Index actuel<br /><span class="value">${invoice.readings.currentIndex}</span></div>
      </div>
    </div>

    <div class="section">
      <h3>Montants</h3>
      <div class="grid">
        <div class="card">Base<br /><span class="value">${invoice.amounts.baseCost} ${invoice.amounts.currency}</span></div>
        <div class="card">Taxes<br /><span class="value">${invoice.amounts.taxAmount} ${invoice.amounts.currency}</span></div>
        <div class="card">Total<br /><span class="totals">${invoice.amounts.totalCost} ${invoice.amounts.currency}</span></div>
      </div>
    </div>

    <div class="section">
      <h3>Paiement</h3>
      <div class="card">
        ${invoice.paymentLink ? `<a class="link" href="${invoice.paymentLink}">${invoice.paymentLink}</a>` : 'Lien de paiement non disponible'}
      </div>
    </div>

    <div class="footer">
      Merci d'utiliser WaterHouse. Pour assistance, contactez votre gestionnaire.
    </div>
  </body>
</html>
    `.trim();
  }

  private static formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toISOString().slice(0, 10);
  }
}
