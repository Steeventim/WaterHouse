/**
 * Tests for InvoicePdfStorageService - Story 5.3
 */

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

const { InvoicePdfStorageService } = require('../InvoicePdfStorageService') as typeof import('../InvoicePdfStorageService');

describe('InvoicePdfStorageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create storage directory and index if missing', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValueOnce(false).mockResolvedValueOnce(false);
    (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);

    await InvoicePdfStorageService.initialize();

    expect(RNFS.mkdir).toHaveBeenCalled();
    expect(RNFS.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('index.json'),
      JSON.stringify([]),
      'utf8'
    );
  });

  it('should save PDF and create access link', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.readFile as jest.Mock).mockResolvedValue('[]');
    (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
    (RNFS.stat as jest.Mock).mockResolvedValue({ size: 1200 });

    const record = await InvoicePdfStorageService.savePdf('inv-001', '<html></html>', 1);

    expect(record.invoiceId).toBe('inv-001');
    expect(record.filePath).toContain('/mock/documents/invoices');
    expect(record.expiresAt).toBeGreaterThan(record.createdAt);

    const link = await InvoicePdfStorageService.getTempAccessLink(record.id);
    expect(link?.url).toContain(record.accessToken);
  });

  it('should return null for expired token', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.readFile as jest.Mock).mockResolvedValue('[]');
    (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
    (RNFS.stat as jest.Mock).mockResolvedValue({ size: 1200 });

    const record = await InvoicePdfStorageService.savePdf('inv-002', '<html></html>', 0);

    const found = await InvoicePdfStorageService.getByToken(record.accessToken);
    expect(found).toBeNull();
  });

  it('should cleanup expired PDFs', async () => {
    (RNFS.exists as jest.Mock).mockResolvedValue(true);
    (RNFS.readFile as jest.Mock).mockResolvedValue('[]');
    (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);
    (RNFS.stat as jest.Mock).mockResolvedValue({ size: 1200 });

    await InvoicePdfStorageService.savePdf('inv-003', '<html></html>', 0);

    const removed = await InvoicePdfStorageService.cleanupExpired();

    expect(removed).toBeGreaterThanOrEqual(1);
    expect(RNFS.unlink).toHaveBeenCalled();
  });
});
