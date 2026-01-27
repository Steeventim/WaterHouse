---
story_id: "2.2"
story_key: "2-2-stockage-local-des-donnees"
epic: "Epic 2: Gestion des Données de Base"
title: "Stockage local des données"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 2.2: Stockage local des données

## User Story

**As a** releveur (meter reader),
**I want** all reference data stored locally,
**So that** I can work completely offline.

## Acceptance Criteria

**Given** Data is synchronized
**When** I lose internet connection
**Then** All reference data remains accessible
**And** App functions normally without network

## Technical Requirements

### Functional Requirements
- **REQ-DATA-002**: Stockage local pour mode hors-ligne complet
- **REQ-OFFLINE-001**: Fonctionnement complet sans connexion réseau

### Non-Functional Requirements
- **REQ-REL-002**: Mode hors-ligne fonctionnel 100% du temps
- **REQ-PERF-001**: Temps de démarrage application < 3 secondes

## Technical Design

### Architecture Context

**Bounded Context**: Catalog
**Mobile Feature**: apps/mobile/src/services/storage/

### Local Storage Architecture

#### SQLite Database Schema
```sql
-- Buildings table
CREATE TABLE buildings (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  manager_id TEXT,
  latitude REAL,
  longitude REAL,
  total_floors INTEGER,
  total_apartments INTEGER,
  created_at TEXT,
  updated_at TEXT
);

-- Apartments table
CREATE TABLE apartments (
  id TEXT PRIMARY KEY,
  building_id TEXT NOT NULL,
  number TEXT NOT NULL,
  floor INTEGER,
  tenant_name TEXT,
  tenant_phone TEXT,
  tenant_email TEXT,
  surface_area REAL,
  rent_amount REAL,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (building_id) REFERENCES buildings(id)
);

-- Meters table
CREATE TABLE meters (
  id TEXT PRIMARY KEY,
  apartment_id TEXT NOT NULL,
  type TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  initial_reading REAL DEFAULT 0,
  current_reading REAL,
  last_reading_date TEXT,
  installation_date TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT,
  updated_at TEXT,
  FOREIGN KEY (apartment_id) REFERENCES apartments(id)
);

-- Indexes for performance
CREATE INDEX idx_buildings_manager ON buildings(manager_id);
CREATE INDEX idx_apartments_building ON apartments(building_id);
CREATE INDEX idx_meters_apartment ON meters(apartment_id);
CREATE INDEX idx_meters_active ON meters(is_active);
```

#### Storage Manager Service
```typescript
// services/storage/storageManager.ts
export class StorageManager {
  private database: SQLiteDatabase;
  private encryptionService: EncryptionService;

  constructor() {
    this.database = SQLite.openDatabase({
      name: 'waterhouse_local.db',
      location: 'default',
    });
    this.encryptionService = new EncryptionService();
  }

  async initialize(): Promise<void> {
    await this.createTables();
    await this.encryptionService.initialize();
  }

  private async createTables(): Promise<void> {
    const schema = [
      `CREATE TABLE IF NOT EXISTS buildings (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        last_modified TEXT,
        version INTEGER DEFAULT 1
      )`,
      `CREATE TABLE IF NOT EXISTS apartments (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        last_modified TEXT,
        version INTEGER DEFAULT 1
      )`,
      `CREATE TABLE IF NOT EXISTS meters (
        id TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        last_modified TEXT,
        version INTEGER DEFAULT 1
      )`,
      `CREATE TABLE IF NOT EXISTS metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      )`
    ];

    for (const query of schema) {
      await this.executeQuery(query);
    }
  }

  async storeBuilding(building: Building): Promise<void> {
    const encryptedData = await this.encryptionService.encrypt(
      JSON.stringify(building)
    );

    const query = `
      INSERT OR REPLACE INTO buildings (id, data, last_modified, version)
      VALUES (?, ?, ?, ?)
    `;

    await this.executeQuery(query, [
      building.id,
      encryptedData,
      new Date().toISOString(),
      (building.version || 0) + 1
    ]);
  }

  async getBuilding(id: string): Promise<Building | null> {
    const query = 'SELECT data FROM buildings WHERE id = ?';
    const result = await this.executeQuery(query, [id]);

    if (result.rows.length === 0) return null;

    const decryptedData = await this.encryptionService.decrypt(
      result.rows.item(0).data
    );

    return JSON.parse(decryptedData);
  }

  async getAllBuildings(): Promise<Building[]> {
    const query = 'SELECT data FROM buildings ORDER BY last_modified DESC';
    const result = await this.executeQuery(query);

    const buildings: Building[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const encryptedData = result.rows.item(i).data;
      const decryptedData = await this.encryptionService.decrypt(encryptedData);
      buildings.push(JSON.parse(decryptedData));
    }

    return buildings;
  }

  async storeApartment(apartment: Apartment): Promise<void> {
    const encryptedData = await this.encryptionService.encrypt(
      JSON.stringify(apartment)
    );

    const query = `
      INSERT OR REPLACE INTO apartments (id, data, last_modified, version)
      VALUES (?, ?, ?, ?)
    `;

    await this.executeQuery(query, [
      apartment.id,
      encryptedData,
      new Date().toISOString(),
      (apartment.version || 0) + 1
    ]);
  }

  async getApartmentsByBuilding(buildingId: string): Promise<Apartment[]> {
    const query = 'SELECT data FROM apartments WHERE json_extract(data, \'$.buildingId\') = ?';
    const result = await this.executeQuery(query, [buildingId]);

    const apartments: Apartment[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const encryptedData = result.rows.item(i).data;
      const decryptedData = await this.encryptionService.decrypt(encryptedData);
      apartments.push(JSON.parse(decryptedData));
    }

    return apartments;
  }

  async storeMeter(meter: Meter): Promise<void> {
    const encryptedData = await this.encryptionService.encrypt(
      JSON.stringify(meter)
    );

    const query = `
      INSERT OR REPLACE INTO meters (id, data, last_modified, version)
      VALUES (?, ?, ?, ?)
    `;

    await this.executeQuery(query, [
      meter.id,
      encryptedData,
      new Date().toISOString(),
      (meter.version || 0) + 1
    ]);
  }

  async getMetersByApartment(apartmentId: string): Promise<Meter[]> {
    const query = 'SELECT data FROM meters WHERE json_extract(data, \'$.apartmentId\') = ? AND json_extract(data, \'$.isActive\') = 1';
    const result = await this.executeQuery(query, [apartmentId]);

    const meters: Meter[] = [];
    for (let i = 0; i < result.rows.length; i++) {
      const encryptedData = result.rows.item(i).data;
      const decryptedData = await this.encryptionService.decrypt(encryptedData);
      meters.push(JSON.parse(decryptedData));
    }

    return meters;
  }

  async getMeterById(id: string): Promise<Meter | null> {
    const query = 'SELECT data FROM meters WHERE id = ?';
    const result = await this.executeQuery(query, [id]);

    if (result.rows.length === 0) return null;

    const decryptedData = await this.encryptionService.decrypt(
      result.rows.item(0).data
    );

    return JSON.parse(decryptedData);
  }

  async updateMeterReading(meterId: string, newReading: number, readingDate: Date): Promise<void> {
    const meter = await this.getMeterById(meterId);
    if (!meter) throw new Error('Meter not found');

    const updatedMeter: Meter = {
      ...meter,
      currentReading: newReading,
      lastReadingDate: readingDate.toISOString(),
      version: (meter.version || 0) + 1
    };

    await this.storeMeter(updatedMeter);
  }

  async getStorageStats(): Promise<StorageStats> {
    const buildingCount = await this.getTableCount('buildings');
    const apartmentCount = await this.getTableCount('apartments');
    const meterCount = await this.getTableCount('meters');

    return {
      buildings: buildingCount,
      apartments: apartmentCount,
      meters: meterCount,
      totalRecords: buildingCount + apartmentCount + meterCount
    };
  }

  private async getTableCount(tableName: string): Promise<number> {
    const query = `SELECT COUNT(*) as count FROM ${tableName}`;
    const result = await this.executeQuery(query);
    return result.rows.item(0).count;
  }

  private async executeQuery(query: string, params: any[] = []): Promise<SQLite.ResultSet> {
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
    const tables = ['buildings', 'apartments', 'meters', 'metadata'];
    for (const table of tables) {
      await this.executeQuery(`DELETE FROM ${table}`);
    }
  }
}
```

### Data Access Layer

#### Repository Pattern Implementation
```typescript
// repositories/buildingRepository.ts
export class BuildingRepository {
  constructor(private storage: StorageManager) {}

  async findById(id: string): Promise<Building | null> {
    return await this.storage.getBuilding(id);
  }

  async findAll(): Promise<Building[]> {
    return await this.storage.getAllBuildings();
  }

  async findByManager(managerId: string): Promise<Building[]> {
    const allBuildings = await this.storage.getAllBuildings();
    return allBuildings.filter(building => building.managerId === managerId);
  }

  async save(building: Building): Promise<void> {
    await this.storage.storeBuilding(building);
  }

  async saveMany(buildings: Building[]): Promise<void> {
    for (const building of buildings) {
      await this.storage.storeBuilding(building);
    }
  }
}

// repositories/apartmentRepository.ts
export class ApartmentRepository {
  constructor(private storage: StorageManager) {}

  async findById(id: string): Promise<Apartment | null> {
    // Implementation for apartment lookup
    return null; // Placeholder
  }

  async findByBuilding(buildingId: string): Promise<Apartment[]> {
    return await this.storage.getApartmentsByBuilding(buildingId);
  }

  async save(apartment: Apartment): Promise<void> {
    await this.storage.storeApartment(apartment);
  }

  async saveMany(apartments: Apartment[]): Promise<void> {
    for (const apartment of apartments) {
      await this.storage.storeApartment(apartment);
    }
  }
}

// repositories/meterRepository.ts
export class MeterRepository {
  constructor(private storage: StorageManager) {}

  async findById(id: string): Promise<Meter | null> {
    return await this.storage.getMeterById(id);
  }

  async findByApartment(apartmentId: string): Promise<Meter[]> {
    return await this.storage.getMetersByApartment(apartmentId);
  }

  async findActiveByApartment(apartmentId: string): Promise<Meter[]> {
    const meters = await this.storage.getMetersByApartment(apartmentId);
    return meters.filter(meter => meter.isActive);
  }

  async updateReading(meterId: string, reading: number, date: Date): Promise<void> {
    await this.storage.updateMeterReading(meterId, reading, date);
  }

  async save(meter: Meter): Promise<void> {
    await this.storage.storeMeter(meter);
  }

  async saveMany(meters: Meter[]): Promise<void> {
    for (const meter of meters) {
      await this.storage.storeMeter(meter);
    }
  }
}
```

### Offline Data Access

#### Data Access Service
```typescript
// services/dataAccess/dataAccessService.ts
export class DataAccessService {
  private buildingRepo: BuildingRepository;
  private apartmentRepo: ApartmentRepository;
  private meterRepo: MeterRepository;

  constructor(storageManager: StorageManager) {
    this.buildingRepo = new BuildingRepository(storageManager);
    this.apartmentRepo = new ApartmentRepository(storageManager);
    this.meterRepo = new MeterRepository(storageManager);
  }

  // Building operations
  async getBuildings(): Promise<Building[]> {
    return await this.buildingRepo.findAll();
  }

  async getBuildingWithApartments(buildingId: string): Promise<BuildingWithApartments | null> {
    const building = await this.buildingRepo.findById(buildingId);
    if (!building) return null;

    const apartments = await this.apartmentRepo.findByBuilding(buildingId);

    return {
      ...building,
      apartments: await Promise.all(
        apartments.map(async (apt) => ({
          ...apt,
          meters: await this.meterRepo.findActiveByApartment(apt.id)
        }))
      )
    };
  }

  // Apartment operations
  async getApartmentsByBuilding(buildingId: string): Promise<Apartment[]> {
    return await this.apartmentRepo.findByBuilding(buildingId);
  }

  async getApartmentWithMeters(apartmentId: string): Promise<ApartmentWithMeters | null> {
    const apartment = await this.apartmentRepo.findById(apartmentId);
    if (!apartment) return null;

    const meters = await this.meterRepo.findActiveByApartment(apartmentId);

    return {
      ...apartment,
      meters
    };
  }

  // Meter operations
  async getMeterDetails(meterId: string): Promise<Meter | null> {
    return await this.meterRepo.findById(meterId);
  }

  async updateMeterReading(meterId: string, reading: number): Promise<void> {
    await this.meterRepo.updateReading(meterId, reading, new Date());
  }

  // Bulk operations for sync
  async syncBuildings(buildings: Building[]): Promise<void> {
    await this.buildingRepo.saveMany(buildings);
  }

  async syncApartments(apartments: Apartment[]): Promise<void> {
    await this.apartmentRepo.saveMany(apartments);
  }

  async syncMeters(meters: Meter[]): Promise<void> {
    await this.meterRepo.saveMany(meters);
  }
}
```

### Testing Strategy

#### Unit Tests
- Storage manager CRUD operations
- Repository pattern implementations
- Data encryption/decryption
- Query performance and optimization

#### Integration Tests
- Complete data workflows
- Repository interactions
- Storage manager with encryption
- Data consistency across operations

#### Performance Tests
- Large dataset storage and retrieval
- Query performance benchmarks
- Memory usage during operations
- Concurrent access handling

### Implementation Checklist

#### Core Storage
- [ ] SQLite database setup and schema
- [ ] Storage manager with encryption integration
- [ ] Repository pattern implementation
- [ ] Data access service layer

#### Data Operations
- [ ] CRUD operations for all entities
- [ ] Bulk operations for synchronization
- [ ] Query optimization and indexing
- [ ] Data validation and integrity

#### Offline Support
- [ ] Complete offline data access
- [ ] Data consistency validation
- [ ] Storage quota management
- [ ] Data cleanup and maintenance

#### Testing
- [ ] Unit tests for storage operations
- [ ] Integration tests for data workflows
- [ ] Performance tests for large datasets
- [ ] Memory leak prevention

### Success Criteria

#### Functional Success
- All catalog data stored locally and encrypted
- Fast access to buildings, apartments, and meters
- Data remains available when offline
- Storage operations are reliable and consistent

#### Technical Success
- SQLite performance meets requirements
- Encryption is transparent to application logic
- Data integrity maintained across operations
- Storage size remains reasonable for mobile

#### Quality Success
- Code coverage > 90% for storage components
- All data operations tested thoroughly
- Performance benchmarks achieved
- Memory usage optimized

### Definition of Done

- [ ] SQLite database schema implemented
- [ ] Storage manager with encryption working
- [ ] Repository pattern fully implemented
- [ ] Data access service operational
- [ ] Offline data access verified
- [ ] Unit and integration tests passing
- [ ] Performance requirements met
- [ ] Code reviewed and approved

### Notes for Developer

**Offline-First Foundation:**
- This storage layer powers the entire offline experience
- Must be highly reliable and performant
- Consider future data migration needs
- Plan for storage quota limits on devices

**Performance Critical:**
- Local queries must be fast (< 100ms typical)
- Encryption should not impact user experience
- Consider lazy loading for large datasets
- Optimize indexes for common query patterns

**Data Integrity:**
- ACID properties must be maintained
- Encryption keys must be properly managed
- Data validation on all operations
- Recovery mechanisms for corrupted data