import * as crypto from 'crypto';

export class EncryptionService {
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly IV_LENGTH = 12; // 96 bits for GCM

  // In production, use a secure key management system
  static getKey(): Buffer {
    // TODO: Replace with secure key retrieval
    const key = process.env.APP_ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
      throw new Error('APP_ENCRYPTION_KEY must be 64 hex chars (32 bytes)');
    }
    return Buffer.from(key, 'hex');
  }

  static encrypt(plainText: string): { cipherText: string; iv: string; tag: string } {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const key = this.getKey();
    const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      cipherText: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      tag: tag.toString('base64'),
    };
  }

  static decrypt(cipherText: string, iv: string, tag: string): string {
    const key = this.getKey();
    const decipher = crypto.createDecipheriv(this.ALGORITHM, key, Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(cipherText, 'base64')),
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }
}
