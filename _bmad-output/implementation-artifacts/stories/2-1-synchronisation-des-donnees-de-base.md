---
story_id: "2.1"
story_key: "2-1-synchronisation-des-donnees-de-base"
epic: "Epic 2: Gestion des Données de Base"
title: "Synchronisation des données de base"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 2.1: Synchronisation des données de base

## User Story

**As a** releveur (meter reader),
**I want** my assigned buildings, apartments and meters to be synchronized,
**So that** I can work with the latest data even offline.

## Acceptance Criteria

**Given** I have internet connection
**When** I open the app
**Then** Latest building/apartment/meter data is downloaded
**And** Data is stored locally for offline access

## Technical Requirements

### Functional Requirements
- **REQ-DATA-001**: Synchronisation des immeubles, logements et compteurs assignés
- **REQ-DATA-003**: Mise à jour automatique des données de référence

### Non-Functional Requirements
- **REQ-PERF-003**: Synchronisation des données < 10 secondes par Mo
- **REQ-REL-002**: Mode hors-ligne fonctionnel 100% du temps

## Technical Design

### Architecture Context

**Bounded Context**: Catalog
**Module**: apps/api/src/modules/catalog/
**Mobile Feature**: apps/mobile/src/features/catalog/

### API Endpoints

#### GET /api/v1/catalog/sync
**Purpose**: Get all catalog data for synchronization
**Query Parameters**:
- `lastSync`: ISO timestamp of last synchronization
- `userId`: User ID for filtering assigned data
**Response**:
```json
{
  "buildings": [
    {
      "id": "building_123",
      "name": "Immeuble A",
      "address": "123 Rue de la Paix, Abidjan",
      "managerId": "user_456",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ],
  "apartments": [
    {
      "id": "apt_123",
      "buildingId": "building_123",
      "number": "A101",
      "floor": 1,
      "tenantName": "Jean Dupont",
      "tenantPhone": "+2250102030405",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ],
  "meters": [
    {
      "id": "meter_123",
      "apartmentId": "apt_123",
      "type": "electricity",
      "serialNumber": "ELEC001234",
      "initialReading": 12345,
      "currentReading": 12567,
      "lastReadingDate": "2026-01-15T00:00:00Z",
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-27T10:00:00Z"
    }
  ],
  "syncTimestamp": "2026-01-27T10:00:00Z",
  "totalRecords": 150
}
```

#### GET /api/v1/catalog/user-assignments
**Purpose**: Get user's assigned buildings and apartments
**Response**:
```json
{
  "userId": "user_123",
  "assignedBuildings": ["building_123", "building_456"],
  "assignedApartments": ["apt_123", "apt_456", "apt_789"],
  "lastAssignmentUpdate": "2026-01-27T10:00:00Z"
}
```

### Database Schema

#### buildings table
```sql
CREATE TABLE buildings (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  manager_id VARCHAR(50),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  total_floors INTEGER,
  total_apartments INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX idx_buildings_manager ON buildings(manager_id);
CREATE INDEX idx_buildings_location ON buildings(latitude, longitude);
```

#### apartments table
```sql
CREATE TABLE apartments (
  id VARCHAR(50) PRIMARY KEY,
  building_id VARCHAR(50) NOT NULL,
  number VARCHAR(20) NOT NULL,
  floor INTEGER,
  tenant_name VARCHAR(100),
  tenant_phone VARCHAR(20),
  tenant_email VARCHAR(100),
  surface_area DECIMAL(8, 2),
  rent_amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (building_id) REFERENCES buildings(id),
  UNIQUE(building_id, number)
);

-- Indexes
CREATE INDEX idx_apartments_building ON apartments(building_id);
CREATE INDEX idx_apartments_tenant ON apartments(tenant_name);
```

#### meters table
```sql
CREATE TABLE meters (
  id VARCHAR(50) PRIMARY KEY,
  apartment_id VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL, -- electricity, water, gas
  serial_number VARCHAR(50) UNIQUE NOT NULL,
  initial_reading DECIMAL(10, 3) DEFAULT 0,
  current_reading DECIMAL(10, 3),
  last_reading_date TIMESTAMP,
  installation_date TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (apartment_id) REFERENCES apartments(id)
);

-- Indexes
CREATE INDEX idx_meters_apartment ON meters(apartment_id);
CREATE INDEX idx_meters_type ON meters(type);
CREATE INDEX idx_meters_serial ON meters(serial_number);
CREATE INDEX idx_meters_active ON meters(is_active);
```

#### user_assignments table
```sql
CREATE TABLE user_assignments (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  building_id VARCHAR(50),
  apartment_id VARCHAR(50),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  assigned_by VARCHAR(50),

  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (building_id) REFERENCES buildings(id),
  FOREIGN KEY (apartment_id) REFERENCES apartments(id),
  FOREIGN KEY (assigned_by) REFERENCES users(id),

  -- Either building or apartment assignment, not both
  CHECK (
    (building_id IS NOT NULL AND apartment_id IS NULL) OR
    (building_id IS NULL AND apartment_id IS NOT NULL)
  )
);

-- Indexes
CREATE INDEX idx_assignments_user ON user_assignments(user_id);
CREATE INDEX idx_assignments_building ON user_assignments(building_id);
CREATE INDEX idx_assignments_apartment ON user_assignments(apartment_id);
```

### Synchronization Service

#### Mobile Sync Manager
```typescript
// services/sync/syncManager.ts
export class SyncManager {
  private readonly SYNC_INTERVAL = 15 * 60 * 1000; // 15 minutes
  private syncInProgress = false;

  constructor(
    private apiClient: ApiClient,
    private localStorage: LocalStorage,
    private networkMonitor: NetworkMonitor
  ) {}

  async initialize(): Promise<void> {
    // Start periodic sync when online
    this.networkMonitor.onNetworkAvailable(() => {
      this.startPeriodicSync();
    });

    this.networkMonitor.onNetworkLost(() => {
      this.stopPeriodicSync();
    });

    // Initial sync on app start
    if (await this.networkMonitor.isOnline()) {
      await this.performFullSync();
    }
  }

  async performFullSync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncInProgress = true;

    try {
      const lastSync = await this.localStorage.getLastSyncTimestamp();
      const userAssignments = await this.getUserAssignments();

      // Sync catalog data
      const catalogData = await this.apiClient.getCatalogSync({
        lastSync,
        userId: userAssignments.userId,
      });

      // Store data locally
      await this.storeCatalogData(catalogData);

      // Update sync timestamp
      await this.localStorage.setLastSyncTimestamp(catalogData.syncTimestamp);

      return {
        success: true,
        recordsSynced: catalogData.totalRecords,
        timestamp: catalogData.syncTimestamp,
      };
    } catch (error) {
      console.error('Sync failed:', error);
      return {
        success: false,
        error: error.message,
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  async performIncrementalSync(): Promise<SyncResult> {
    // Similar to full sync but with delta updates
    return this.performFullSync();
  }

  private async getUserAssignments(): Promise<UserAssignments> {
    return await this.localStorage.getUserAssignments() ||
           await this.apiClient.getUserAssignments();
  }

  private async storeCatalogData(data: CatalogSyncData): Promise<void> {
    const transaction = await this.localStorage.beginTransaction();

    try {
      // Store buildings
      for (const building of data.buildings) {
        await this.localStorage.upsertBuilding(building);
      }

      // Store apartments
      for (const apartment of data.apartments) {
        await this.localStorage.upsertApartment(apartment);
      }

      // Store meters
      for (const meter of data.meters) {
        await this.localStorage.upsertMeter(meter);
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  private startPeriodicSync(): void {
    // Implementation for periodic sync
  }

  private stopPeriodicSync(): void {
    // Implementation to stop periodic sync
  }
}
```

#### Local Storage Manager
```typescript
// services/storage/localStorage.ts
export class LocalStorage {
  private database: SQLiteDatabase;

  constructor() {
    this.database = SQLite.openDatabase({
      name: 'waterhouse_catalog.db',
      location: 'default',
    });
  }

  async initialize(): Promise<void> {
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    const queries = [
      `CREATE TABLE IF NOT EXISTS buildings (
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
      )`,
      `CREATE TABLE IF NOT EXISTS apartments (
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
      )`,
      `CREATE TABLE IF NOT EXISTS meters (
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
      )`,
      `CREATE TABLE IF NOT EXISTS sync_metadata (
        key TEXT PRIMARY KEY,
        value TEXT
      )`,
    ];

    for (const query of queries) {
      await this.executeQuery(query);
    }
  }

  async upsertBuilding(building: Building): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO buildings
      (id, name, address, manager_id, latitude, longitude, total_floors, total_apartments, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.executeQuery(query, [
      building.id, building.name, building.address, building.managerId,
      building.latitude, building.longitude, building.totalFloors,
      building.totalApartments, building.createdAt, building.updatedAt
    ]);
  }

  async upsertApartment(apartment: Apartment): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO apartments
      (id, building_id, number, floor, tenant_name, tenant_phone, tenant_email, surface_area, rent_amount, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.executeQuery(query, [
      apartment.id, apartment.buildingId, apartment.number, apartment.floor,
      apartment.tenantName, apartment.tenantPhone, apartment.tenantEmail,
      apartment.surfaceArea, apartment.rentAmount, apartment.createdAt, apartment.updatedAt
    ]);
  }

  async upsertMeter(meter: Meter): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO meters
      (id, apartment_id, type, serial_number, initial_reading, current_reading, last_reading_date, installation_date, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await this.executeQuery(query, [
      meter.id, meter.apartmentId, meter.type, meter.serialNumber,
      meter.initialReading, meter.currentReading, meter.lastReadingDate,
      meter.installationDate, meter.isActive ? 1 : 0, meter.createdAt, meter.updatedAt
    ]);
  }

  async getLastSyncTimestamp(): Promise<string | null> {
    const result = await this.executeQuery(
      'SELECT value FROM sync_metadata WHERE key = ?',
      ['last_sync_timestamp']
    );
    return result.rows.length > 0 ? result.rows.item(0).value : null;
  }

  async setLastSyncTimestamp(timestamp: string): Promise<void> {
    await this.executeQuery(
      'INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)',
      ['last_sync_timestamp', timestamp]
    );
  }

  async getUserAssignments(): Promise<UserAssignments | null> {
    const result = await this.executeQuery(
      'SELECT value FROM sync_metadata WHERE key = ?',
      ['user_assignments']
    );
    if (result.rows.length > 0) {
      return JSON.parse(result.rows.item(0).value);
    }
    return null;
  }

  async setUserAssignments(assignments: UserAssignments): Promise<void> {
    await this.executeQuery(
      'INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)',
      ['user_assignments', JSON.stringify(assignments)]
    );
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

  async beginTransaction(): Promise<SQLiteTransaction> {
    return new Promise((resolve, reject) => {
      this.database.transaction(
        tx => resolve(tx),
        error => reject(error)
      );
    });
  }
}
```

### Network Monitor

#### Network State Management
```typescript
// services/network/networkMonitor.ts
export class NetworkMonitor {
  private isOnline = false;
  private networkAvailableCallbacks: (() => void)[] = [];
  private networkLostCallbacks: (() => void)[] = [];

  constructor() {
    NetInfo.addEventListener(this.handleNetworkChange);
    this.checkInitialState();
  }

  private async checkInitialState(): Promise<void> {
    const state = await NetInfo.fetch();
    this.isOnline = state.isConnected ?? false;
  }

  private handleNetworkChange = (state: NetInfoState) => {
    const wasOnline = this.isOnline;
    this.isOnline = state.isConnected ?? false;

    if (!wasOnline && this.isOnline) {
      // Network became available
      this.networkAvailableCallbacks.forEach(callback => callback());
    } else if (wasOnline && !this.isOnline) {
      // Network was lost
      this.networkLostCallbacks.forEach(callback => callback());
    }
  };

  async isOnline(): Promise<boolean> {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  }

  onNetworkAvailable(callback: () => void): void {
    this.networkAvailableCallbacks.push(callback);
  }

  onNetworkLost(callback: () => void): void {
    this.networkLostCallbacks.push(callback);
  }

  removeNetworkAvailableCallback(callback: () => void): void {
    const index = this.networkAvailableCallbacks.indexOf(callback);
    if (index > -1) {
      this.networkAvailableCallbacks.splice(index, 1);
    }
  }

  removeNetworkLostCallback(callback: () => void): void {
    const index = this.networkLostCallbacks.indexOf(callback);
    if (index > -1) {
      this.networkLostCallbacks.splice(index, 1);
    }
  }
}
```

### Sync Progress and UI

#### Sync Status Component
```typescript
// components/SyncStatus.tsx
interface SyncStatusProps {
  isOnline: boolean;
  lastSyncTime: Date | null;
  isSyncing: boolean;
  onManualSync: () => void;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({
  isOnline,
  lastSyncTime,
  isSyncing,
  onManualSync,
}) => {
  const getStatusColor = () => {
    if (!isOnline) return 'red';
    if (isSyncing) return 'blue';
    return 'green';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Hors ligne';
    if (isSyncing) return 'Synchronisation...';
    return 'Synchronisé';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.statusText}>{getStatusText()}</Text>

      {lastSyncTime && (
        <Text style={styles.lastSyncText}>
          Dernière sync: {lastSyncTime.toLocaleString('fr-FR')}
        </Text>
      )}

      {isOnline && !isSyncing && (
        <TouchableOpacity onPress={onManualSync} style={styles.syncButton}>
          <Text>Synchroniser</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

### Testing Strategy

#### Unit Tests
- Sync manager logic and state management
- Local storage operations
- Network monitor state changes
- Data transformation and validation

#### Integration Tests
- Complete sync workflow (API → Storage)
- Network state changes during sync
- Data consistency after sync
- Error handling and recovery

#### E2E Tests
- App startup sync process
- Manual sync trigger
- Offline/online transitions
- Data availability in offline mode

### Implementation Checklist

#### Backend Implementation
- [ ] Catalog module with sync endpoints
- [ ] Database schema for catalog entities
- [ ] User assignment logic
- [ ] Data filtering for assigned entities
- [ ] Sync timestamp management

#### Mobile Implementation
- [ ] Network monitor service
- [ ] Local SQLite storage
- [ ] Sync manager with full/incremental sync
- [ ] Sync status UI component
- [ ] Background sync scheduling
- [ ] Error handling and retry logic

#### Testing
- [ ] Unit tests for all sync components
- [ ] Integration tests for sync workflow
- [ ] E2E tests for complete sync process
- [ ] Performance testing for large datasets

### Dependencies

#### Backend Dependencies
- @nestjs/typeorm (already included)
- typeorm (already included)

#### Mobile Dependencies
- @react-native-community/netinfo
- react-native-sqlite-storage (already included)
- @react-native-async-storage/async-storage (already included)

### Success Criteria

#### Functional Success
- Catalog data syncs automatically on app start
- All assigned buildings/apartments/meters available offline
- Manual sync works when requested
- Sync status is clearly visible to user

#### Technical Success
- Sync completes within performance requirements (< 10s/MB)
- Data integrity maintained during sync
- Efficient storage usage on mobile device
- Network state changes handled gracefully

#### Quality Success
- Code coverage > 90% for sync components
- All error scenarios handled gracefully
- User experience smooth during sync operations
- Data consistency validated

### Definition of Done

- [ ] Catalog sync API endpoints implemented
- [ ] Database schema created and seeded
- [ ] Mobile sync manager working
- [ ] Local storage integration complete
- [ ] Network monitoring implemented
- [ ] Sync status UI component built
- [ ] Unit and integration tests passing
- [ ] E2E tests passing
- [ ] Performance benchmarks met
- [ ] Code reviewed and approved

### Notes for Developer

**Foundation for Offline-First:**
- This is the first data synchronization story
- Must be rock-solid for all subsequent features
- Consider data volume and mobile storage limits
- Plan for future incremental sync optimizations

**Data Architecture Decisions:**
- Local SQLite for fast queries and offline access
- Sync on app start ensures fresh data
- User assignments filter relevant data only
- Consider data partitioning for large deployments

**Performance Considerations:**
- Initial sync might be large - implement progress indicators
- Background sync should not impact user experience
- Optimize database queries and indexes
- Consider data compression for network transfer

**Error Handling:**
- Network failures should not break the app
- Partial sync states need careful handling
- Data conflicts (rare but possible) need resolution
- Clear user feedback for all sync states