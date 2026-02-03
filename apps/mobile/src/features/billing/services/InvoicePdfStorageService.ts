/**
 * InvoicePdfStorageService - stores generated invoice PDFs and issues temp links
 * Story 5.3: Génération de factures PDF
 */

import RNFS from 'react-native-fs';

export interface StoredInvoicePdf {
  id: string;
  invoiceId: string;
  filePath: string;
  sizeBytes: number;
  createdAt: number;
  expiresAt: number;
  accessToken: string;
}

export interface TempAccessLink {
  url: string;
  expiresAt: number;
}

export class InvoicePdfStorageService {
  private static index: StoredInvoicePdf[] | null = null;

  private static getFs(): typeof RNFS {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fallback = typeof RNFS === 'undefined' ? require('react-native-fs') : RNFS;
    return fallback as typeof RNFS;
  }

  private static getPdfDir(): string {
    const fs = this.getFs();
    const basePath = fs?.DocumentDirectoryPath ?? '/tmp';
    return `${basePath}/invoices`;
  }

  private static getIndexFile(): string {
    return `${this.getPdfDir()}/index.json`;
  }

  static async initialize(): Promise<void> {
    const fs = this.getFs();
    const dirPath = this.getPdfDir();
    const indexPath = this.getIndexFile();

    const dirExists = await fs.exists(dirPath);
    if (!dirExists) {
      await fs.mkdir(dirPath);
    }

    const indexExists = await fs.exists(indexPath);
    if (!indexExists) {
      await fs.writeFile(indexPath, JSON.stringify([]), 'utf8');
    }

    await this.loadIndex();
  }

  static async savePdf(
    invoiceId: string,
    content: string,
    expiresInDays = 30
  ): Promise<StoredInvoicePdf> {
    const fs = this.getFs();
    await this.initialize();

    const id = `invoice-pdf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const filePath = `${this.getPdfDir()}/${id}.pdf`;

    await fs.writeFile(filePath, content, 'utf8');

    const stat = await fs.stat(filePath);
    const now = Date.now();
    const record: StoredInvoicePdf = {
      id,
      invoiceId,
      filePath,
      sizeBytes: Number(stat.size ?? content.length),
      createdAt: now,
      expiresAt: now + expiresInDays * 24 * 60 * 60 * 1000,
      accessToken: this.generateAccessToken(),
    };

    this.index = [...(this.index ?? []), record];
    await this.persistIndex();

    return record;
  }

  static async getTempAccessLink(recordId: string): Promise<TempAccessLink | null> {
    await this.loadIndex();
    const record = (this.index ?? []).find((r) => r.id === recordId);
    if (!record) return null;

    return {
      url: `${record.filePath}?token=${record.accessToken}`,
      expiresAt: record.expiresAt,
    };
  }

  static async getByToken(token: string): Promise<StoredInvoicePdf | null> {
    await this.loadIndex();
    const record = (this.index ?? []).find((r) => r.accessToken === token);
    if (!record) return null;
    if (record.expiresAt < Date.now()) return null;
    return record;
  }

  static async cleanupExpired(): Promise<number> {
    const fs = this.getFs();
    await this.loadIndex();
    const now = Date.now();
    const current = this.index ?? [];
    const expired = current.filter((r) => r.expiresAt < now);

    for (const record of expired) {
      const exists = await fs.exists(record.filePath);
      if (exists) {
        await fs.unlink(record.filePath);
      }
    }

    this.index = current.filter((r) => r.expiresAt >= now);
    await this.persistIndex();

    return expired.length;
  }

  private static async loadIndex(): Promise<void> {
    if (this.index) return;

    const indexPath = this.getIndexFile();
    const fs = this.getFs();
    const indexExists = await fs.exists(indexPath);
    if (!indexExists) {
      this.index = [];
      return;
    }

    const raw = await fs.readFile(indexPath, 'utf8');
    this.index = JSON.parse(raw || '[]');
  }

  private static async persistIndex(): Promise<void> {
    const fs = this.getFs();
    await fs.writeFile(this.getIndexFile(), JSON.stringify(this.index ?? []), 'utf8');
  }

  private static generateAccessToken(): string {
    return Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  }
}
