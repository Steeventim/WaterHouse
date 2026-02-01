/**
 * Common sync type definitions shared between mobile and backend
 */

export interface Building {
  id: string;
  name: string;
  address: string;
  managerId?: string;
  latitude?: number;
  longitude?: number;
  totalFloors?: number;
  totalApartments?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Apartment {
  id: string;
  buildingId: string;
  number: string;
  floor?: number;
  tenantName?: string;
  tenantPhone?: string;
  tenantEmail?: string;
  surfaceArea?: number;
  rentAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Meter {
  id: string;
  apartmentId: string;
  type: 'electricity' | 'water' | 'gas';
  serialNumber: string;
  initialReading: number;
  currentReading?: number;
  lastReadingDate?: string;
  installationDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserAssignments {
  userId: string;
  assignedBuildings: string[];
  assignedApartments: string[];
  lastAssignmentUpdate?: string;
}

export interface CatalogSyncData {
  buildings: Building[];
  apartments: Apartment[];
  meters: Meter[];
  syncTimestamp: string;
  totalRecords: number;
}

export interface SyncResult {
  success: boolean;
  recordsSynced?: number;
  timestamp?: string;
  error?: string;
}

export interface SyncProgress {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime?: Date;
  syncError?: string;
}
