/**
 * Local storage service for WaterHouse mobile application
 * Handles SQLite database operations for offline storage of catalog data
 */

import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import {
  Building,
  Apartment,
  Meter,
  UserAssignments,
  CatalogSyncData,
} from '../../../common/types/sync.types';

// Enable debug logging during development
SQLite.DEBUG(true);
SQLite.enablePromise(true);

export class LocalStorage {
  private database: SQLiteDatabase | null = null;
  private isInitialized = false;

  /**
   * Initialize SQLite database and create tables
   */
  async initialize(): Promise<void> {
    if (this.isInitialized && this.database) {
      return;
    }

    try {
      this.database = await SQLite.openDatabase({
        name: 'waterhouse_catalog.db',
        location: 'default',
      });

      await this.createTables();
      this.isInitialized = true;
      console.log('LocalStorage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize LocalStorage:', error);
      throw error;
    }
  }

  /**
   * Create all required tables if they don't exist
   */
  private async createTables(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

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
      try {
        await this.database.executeSql(query);
      } catch (error) {
        // Ignore if table already exists
        if (!String(error).includes('already exists')) {
          throw error;
        }
      }
    }
  }

  /**
   * Upsert building into local storage
   */
  async upsertBuilding(building: Building): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      INSERT OR REPLACE INTO buildings
      (id, name, address, manager_id, latitude, longitude, total_floors, total_apartments, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.database.executeSql(query, [
      building.id,
      building.name,
      building.address,
      building.managerId || null,
      building.latitude || null,
      building.longitude || null,
      building.totalFloors || null,
      building.totalApartments || null,
      building.createdAt,
      building.updatedAt,
    ]);
  }

  /**
   * Upsert apartment into local storage
   */
  async upsertApartment(apartment: Apartment): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      INSERT OR REPLACE INTO apartments
      (id, building_id, number, floor, tenant_name, tenant_phone, tenant_email, surface_area, rent_amount, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.database.executeSql(query, [
      apartment.id,
      apartment.buildingId,
      apartment.number,
      apartment.floor || null,
      apartment.tenantName || null,
      apartment.tenantPhone || null,
      apartment.tenantEmail || null,
      apartment.surfaceArea || null,
      apartment.rentAmount || null,
      apartment.createdAt,
      apartment.updatedAt,
    ]);
  }

  /**
   * Upsert meter into local storage
   */
  async upsertMeter(meter: Meter): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query = `
      INSERT OR REPLACE INTO meters
      (id, apartment_id, type, serial_number, initial_reading, current_reading, last_reading_date, installation_date, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.database.executeSql(query, [
      meter.id,
      meter.apartmentId,
      meter.type,
      meter.serialNumber,
      meter.initialReading,
      meter.currentReading || null,
      meter.lastReadingDate || null,
      meter.installationDate || null,
      meter.isActive ? 1 : 0,
      meter.createdAt,
      meter.updatedAt,
    ]);
  }

  /**
   * Get last sync timestamp
   */
  async getLastSyncTimestamp(): Promise<string | null> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.database.executeSql(
        'SELECT value FROM sync_metadata WHERE key = ?',
        ['last_sync_timestamp']
      );

      if (result.rows.length > 0) {
        return result.rows.item(0).value;
      }
      return null;
    } catch (error) {
      console.error('Failed to get last sync timestamp:', error);
      return null;
    }
  }

  /**
   * Set last sync timestamp
   */
  async setLastSyncTimestamp(timestamp: string): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query =
      'INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)';
    await this.database.executeSql(query, ['last_sync_timestamp', timestamp]);
  }

  /**
   * Get user assignments from local storage
   */
  async getUserAssignments(): Promise<UserAssignments | null> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.database.executeSql(
        'SELECT value FROM sync_metadata WHERE key = ?',
        ['user_assignments']
      );

      if (result.rows.length > 0) {
        const value = result.rows.item(0).value;
        return JSON.parse(value);
      }
      return null;
    } catch (error) {
      console.error('Failed to get user assignments:', error);
      return null;
    }
  }

  /**
   * Set user assignments in local storage
   */
  async setUserAssignments(assignments: UserAssignments): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    const query =
      'INSERT OR REPLACE INTO sync_metadata (key, value) VALUES (?, ?)';
    await this.database.executeSql(query, [
      'user_assignments',
      JSON.stringify(assignments),
    ]);
  }

  /**
   * Store complete catalog data
   */
  async storeCatalogData(data: CatalogSyncData): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      // Store buildings
      for (const building of data.buildings) {
        await this.upsertBuilding(building);
      }

      // Store apartments
      for (const apartment of data.apartments) {
        await this.upsertApartment(apartment);
      }

      // Store meters
      for (const meter of data.meters) {
        await this.upsertMeter(meter);
      }

      // Update sync timestamp
      await this.setLastSyncTimestamp(data.syncTimestamp);
    } catch (error) {
      console.error('Failed to store catalog data:', error);
      throw error;
    }
  }

  /**
   * Get all buildings from local storage
   */
  async getAllBuildings(): Promise<Building[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.database.executeSql(
        'SELECT * FROM buildings ORDER BY name ASC'
      );
      const buildings: Building[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        buildings.push(result.rows.item(i));
      }

      return buildings;
    } catch (error) {
      console.error('Failed to get buildings:', error);
      return [];
    }
  }

  /**
   * Get all apartments from local storage
   */
  async getAllApartments(): Promise<Apartment[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.database.executeSql(
        'SELECT * FROM apartments ORDER BY number ASC'
      );
      const apartments: Apartment[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        apartments.push(result.rows.item(i));
      }

      return apartments;
    } catch (error) {
      console.error('Failed to get apartments:', error);
      return [];
    }
  }

  /**
   * Get all meters from local storage
   */
  async getAllMeters(): Promise<Meter[]> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.database.executeSql(
        'SELECT * FROM meters WHERE is_active = 1 ORDER BY serial_number ASC'
      );
      const meters: Meter[] = [];

      for (let i = 0; i < result.rows.length; i++) {
        meters.push(result.rows.item(i));
      }

      return meters;
    } catch (error) {
      console.error('Failed to get meters:', error);
      return [];
    }
  }

  /**
   * Clear all data from local storage
   */
  async clearAll(): Promise<void> {
    if (!this.database) {
      throw new Error('Database not initialized');
    }

    try {
      await this.database.executeSql('DELETE FROM meters');
      await this.database.executeSql('DELETE FROM apartments');
      await this.database.executeSql('DELETE FROM buildings');
      await this.database.executeSql('DELETE FROM sync_metadata');
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.database) {
      try {
        await this.database.close();
        this.database = null;
        this.isInitialized = false;
      } catch (error) {
        console.error('Failed to close database:', error);
      }
    }
  }
}
