---
story_id: "1.4"
story_key: "1-4-chiffrement-des-donnees-sensibles"
epic: "Epic 1: Authentification et Accès Sécurisé"
title: "Chiffrement des données sensibles"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 1.4: Chiffrement des données sensibles

## User Story

**As a** developer,
**I want** sensitive data (photos, personal info) to be encrypted,
**So that** data privacy is protected even if device is compromised.

## Acceptance Criteria

**Given** Sensitive data is stored
**When** Data is at rest on device
**Then** Data is encrypted with AES-256
**And** Decryption requires valid authentication

## Technical Requirements

### Functional Requirements
- **REQ-AUTH-004**: Chiffrement des données sensibles (photos, données personnelles)
- **REQ-SEC-001**: Chiffrement AES-256 des données sensibles

### Non-Functional Requirements
- **REQ-SEC-005**: Conformité RGPD pour les données personnelles
- **REQ-PERF-002**: Saisie d'un relevé complet < 30 secondes

## Technical Design

### Architecture Context

**Bounded Context**: Auth + Catalog + Relevé
**Modules**:
- apps/api/src/modules/auth/ (encryption keys)
- apps/mobile/src/services/encryption/
- apps/mobile/src/services/storage/

### Encryption Strategy

#### Key Management System
```typescript
// services/encryption/keyManager.ts
export class KeyManager {
  private static readonly KEY_ALIAS = 'waterhouse_master_key';
  private static readonly KEY_SIZE = 256; // AES-256

  static async generateMasterKey(): Promise<string> {
    // Generate AES-256 key derived from user credentials
    const userId = await this.getCurrentUserId();
    const deviceId = await this.getDeviceId();
    const seed = `${userId}:${deviceId}:${process.env.APP_SECRET}`;

    // Use PBKDF2 to derive key from seed
    const key = await this.deriveKey(seed);
    return key;
  }

  static async getEncryptionKey(): Promise<CryptoKey> {
    const masterKey = await this.generateMasterKey();

    return crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(masterKey),
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  private static async deriveKey(seed: string): Promise<string> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(seed),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const salt = encoder.encode('WaterHouseSalt2026');
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256
    );

    return btoa(String.fromCharCode(...new Uint8Array(derivedBits)));
  }

  private static async getCurrentUserId(): Promise<string> {
    // Get from secure storage
    return 'user_123';
  }

  private static async getDeviceId(): Promise<string> {
    // Get unique device identifier
    return 'device_456';
  }
}
```

#### Data Classification
```typescript
// types/dataClassification.ts
export enum DataSensitivity {
  PUBLIC = 'public',           // Building names, addresses
  INTERNAL = 'internal',       // Meter readings, timestamps
  SENSITIVE = 'sensitive',     // Photos, personal info
  CRITICAL = 'critical'        // Authentication data, encryption keys
}

export const DATA_CLASSIFICATION: Record<string, DataSensitivity> = {
  // User data
  'user.phoneNumber': DataSensitivity.SENSITIVE,
  'user.name': DataSensitivity.SENSITIVE,
  'user.email': DataSensitivity.SENSITIVE,

  // Reading data
  'reading.photo': DataSensitivity.SENSITIVE,
  'reading.meterValue': DataSensitivity.INTERNAL,
  'reading.timestamp': DataSensitivity.INTERNAL,
  'reading.location': DataSensitivity.INTERNAL,

  // Building data
  'building.name': DataSensitivity.PUBLIC,
  'building.address': DataSensitivity.PUBLIC,
  'building.managerContact': DataSensitivity.SENSITIVE,

  // Authentication
  'auth.pin': DataSensitivity.CRITICAL,
  'auth.tokens': DataSensitivity.CRITICAL,
};
```

### Encryption Service

#### AES-GCM Encryption Implementation
```typescript
// services/encryption/encryptionService.ts
export class EncryptionService {
  private static readonly ALGORITHM = 'AES-GCM';
  private static readonly IV_LENGTH = 12; // 96 bits

  static async encrypt(data: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const iv = crypto.getRandomValues(new Uint8Array(this.IV_LENGTH));

    const encrypted = await crypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv,
      },
      key,
      dataBuffer
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);

    return btoa(String.fromCharCode(...combined));
  }

  static async decrypt(encryptedData: string, key: CryptoKey): Promise<string> {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );

    const iv = combined.slice(0, this.IV_LENGTH);
    const encrypted = combined.slice(this.IV_LENGTH);

    const decrypted = await crypto.subtle.decrypt(
      {
        name: this.ALGORITHM,
        iv,
      },
      key,
      encrypted
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  static async encryptObject<T extends Record<string, any>>(
    obj: T,
    key: CryptoKey
  ): Promise<T> {
    const result = { ...obj };

    for (const [field, value] of Object.entries(obj)) {
      const sensitivity = DATA_CLASSIFICATION[field];
      if (sensitivity === DataSensitivity.SENSITIVE ||
          sensitivity === DataSensitivity.CRITICAL) {
        if (typeof value === 'string') {
          result[field] = await this.encrypt(value, key);
        } else if (typeof value === 'object' && value !== null) {
          result[field] = await this.encryptObject(value, key);
        }
      }
    }

    return result;
  }

  static async decryptObject<T extends Record<string, any>>(
    obj: T,
    key: CryptoKey
  ): Promise<T> {
    const result = { ...obj };

    for (const [field, value] of Object.entries(obj)) {
      const sensitivity = DATA_CLASSIFICATION[field];
      if (sensitivity === DataSensitivity.SENSITIVE ||
          sensitivity === DataSensitivity.CRITICAL) {
        if (typeof value === 'string') {
          try {
            result[field] = await this.decrypt(value, key);
          } catch (error) {
            // If decryption fails, keep original (might not be encrypted)
            console.warn(`Failed to decrypt field ${field}:`, error);
          }
        } else if (typeof value === 'object' && value !== null) {
          result[field] = await this.decryptObject(value, key);
        }
      }
    }

    return result;
  }
}
```

### Secure Storage Integration

#### Encrypted SQLite Storage
```typescript
// services/storage/secureStorage.ts
import SQLite from 'react-native-sqlite-storage';
import { EncryptionService } from '../encryption/encryptionService';
import { KeyManager } from '../encryption/keyManager';

export class SecureStorage {
  private database: SQLite.SQLiteDatabase;
  private encryptionKey: CryptoKey | null = null;

  constructor(databaseName: string = 'waterhouse_secure.db') {
    this.database = SQLite.openDatabase({
      name: databaseName,
      location: 'default',
    });
  }

  async initialize(): Promise<void> {
    this.encryptionKey = await KeyManager.getEncryptionKey();
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    const queries = [
      `CREATE TABLE IF NOT EXISTS readings (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS user_data (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    for (const query of queries) {
      await this.executeQuery(query);
    }
  }

  async storeReading(reading: any): Promise<void> {
    if (!this.encryptionKey) throw new Error('Storage not initialized');

    const encryptedReading = await EncryptionService.encryptObject(
      reading,
      this.encryptionKey
    );

    const query = 'INSERT OR REPLACE INTO readings (id, data) VALUES (?, ?)';
    await this.executeQuery(query, [reading.id, JSON.stringify(encryptedReading)]);
  }

  async getReading(id: string): Promise<any> {
    if (!this.encryptionKey) throw new Error('Storage not initialized');

    const query = 'SELECT data FROM readings WHERE id = ?';
    const result = await this.executeQuery(query, [id]);

    if (result.rows.length === 0) return null;

    const encryptedData = JSON.parse(result.rows.item(0).data);
    return await EncryptionService.decryptObject(encryptedData, this.encryptionKey);
  }

  async storeUserData(key: string, value: any): Promise<void> {
    if (!this.encryptionKey) throw new Error('Storage not initialized');

    const encryptedValue = await EncryptionService.encrypt(
      JSON.stringify(value),
      this.encryptionKey
    );

    const query = 'INSERT OR REPLACE INTO user_data (key, value) VALUES (?, ?)';
    await this.executeQuery(query, [key, encryptedValue]);
  }

  async getUserData(key: string): Promise<any> {
    if (!this.encryptionKey) throw new Error('Storage not initialized');

    const query = 'SELECT value FROM user_data WHERE key = ?';
    const result = await this.executeQuery(query, [key]);

    if (result.rows.length === 0) return null;

    const decryptedValue = await EncryptionService.decrypt(
      result.rows.item(0).value,
      this.encryptionKey
    );

    return JSON.parse(decryptedValue);
  }

  private executeQuery(query: string, params: any[] = []): Promise<SQLite.ResultSet> {
    return new Promise((resolve, reject) => {
      this.database.transaction(tx => {
        tx.executeSql(
          query,
          params,
          (_, result) => resolve(result),
          (_, error) => reject(error)
        );
      });
    });
  }

  async clearAllData(): Promise<void> {
    const queries = [
      'DELETE FROM readings',
      'DELETE FROM user_data',
    ];

    for (const query of queries) {
      await this.executeQuery(query);
    }
  }
}
```

### File Encryption for Photos

#### Photo Encryption Service
```typescript
// services/encryption/photoEncryption.ts
export class PhotoEncryptionService {
  static async encryptPhoto(uri: string, key: CryptoKey): Promise<string> {
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: crypto.getRandomValues(new Uint8Array(12)),
      },
      key,
      arrayBuffer
    );

    // Convert to base64 for storage
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  }

  static async decryptPhoto(encryptedData: string, key: CryptoKey): Promise<string> {
    const encrypted = new Uint8Array(
      atob(encryptedData).split('').map(c => c.charCodeAt(0))
    );

    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: encrypted.slice(0, 12),
      },
      key,
      encrypted.slice(12)
    );

    // Convert back to blob URL for display
    const blob = new Blob([decrypted], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }
}
```

### Key Rotation and Migration

#### Key Rotation Strategy
```typescript
// services/encryption/keyRotation.ts
export class KeyRotationService {
  static async rotateKeys(): Promise<void> {
    // Generate new master key
    const newKey = await KeyManager.generateMasterKey();

    // Re-encrypt all sensitive data with new key
    const secureStorage = new SecureStorage();
    await secureStorage.initialize();

    // Migrate readings
    const readings = await this.getAllReadings();
    for (const reading of readings) {
      await secureStorage.storeReading(reading); // Will use new key
    }

    // Migrate user data
    const userDataKeys = await this.getAllUserDataKeys();
    for (const key of userDataKeys) {
      const value = await secureStorage.getUserData(key); // Old key
      await secureStorage.storeUserData(key, value); // New key
    }

    // Update key version
    await this.updateKeyVersion();
  }

  private static async getAllReadings(): Promise<any[]> {
    // Implementation to get all readings for re-encryption
    return [];
  }

  private static async getAllUserDataKeys(): Promise<string[]> {
    // Implementation to get all user data keys
    return [];
  }

  private static async updateKeyVersion(): Promise<void> {
    // Update key version in secure storage
  }
}
```

### Testing Strategy

#### Unit Tests
- Encryption/decryption of various data types
- Key generation and derivation
- Data classification logic
- Storage operations with encryption

#### Integration Tests
- Complete data lifecycle (store → encrypt → retrieve → decrypt)
- Key rotation process
- Photo encryption/decryption
- Database operations with encrypted data

#### Security Tests
- Encryption strength validation
- Key derivation security
- Data integrity checks
- Tamper detection

### Implementation Checklist

#### Core Encryption
- [ ] AES-256-GCM encryption service
- [ ] Key management and derivation
- [ ] Data classification system
- [ ] Encryption/decryption utilities

#### Storage Integration
- [ ] Secure SQLite storage wrapper
- [ ] Encrypted photo handling
- [ ] User data encryption
- [ ] Reading data encryption

#### Security Features
- [ ] Key rotation mechanism
- [ ] Secure key storage
- [ ] Data integrity validation
- [ ] Tamper detection

#### Testing
- [ ] Unit tests for encryption logic
- [ ] Integration tests for storage
- [ ] Security testing and validation
- [ ] Performance testing

### Dependencies

#### Mobile Dependencies
- react-native-sqlite-storage (already included)
- expo-crypto (for encryption)
- expo-file-system (for file operations)

### Success Criteria

#### Functional Success
- All sensitive data is encrypted at rest
- Photos are encrypted before storage
- Data can be decrypted only with valid authentication
- Encryption is transparent to application logic

#### Technical Success
- AES-256 encryption standard implemented
- Key derivation is secure and deterministic
- Performance impact is minimal (< 10% overhead)
- Memory usage is optimized for mobile

#### Security Success
- Encryption keys are properly protected
- No sensitive data in plain text
- RGPD compliance maintained
- Security audit passed

### Definition of Done

- [ ] AES-256 encryption implemented for all sensitive data
- [ ] Photo encryption working for meter reading photos
- [ ] Secure storage integration complete
- [ ] Key management system operational
- [ ] Data classification enforced
- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Code reviewed and approved

### Notes for Developer

**Critical Security Component:**
- This is the foundation of data protection
- Must be implemented before any sensitive data handling
- Zero tolerance for security vulnerabilities
- Regular security audits required

**Performance Considerations:**
- Encryption should not impact user experience
- Consider lazy decryption for large datasets
- Optimize key derivation for frequent operations
- Monitor memory usage on low-end devices

**Compliance Requirements:**
- RGPD compliance for personal data
- Industry-standard encryption algorithms
- Secure key management practices
- Audit trails for encryption operations

**Migration Strategy:**
- Implement encryption from day one
- Plan for key rotation in future versions
- Consider backward compatibility for existing data
- Test migration scenarios thoroughly