import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building, Apartment, Meter, UserAssignment } from '../../../../libs/entities/src/index';

export interface SyncCatalogParams {
  lastSync?: string;
  userId?: string;
}

@Injectable()
export class CatalogService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepo: Repository<Building>,
    @InjectRepository(Apartment)
    private readonly apartmentRepo: Repository<Apartment>,
    @InjectRepository(Meter)
    private readonly meterRepo: Repository<Meter>,
    @InjectRepository(UserAssignment)
    private readonly userAssignmentRepo: Repository<UserAssignment>,
  ) {}

  // --- CRUD Compteurs (Meters) ---
  async findAllMeters(query?: any) {
    // TODO: pagination/filtrage
    return this.meterRepo.find();
  }

  async findMeterById(id: string) {
    return this.meterRepo.findOne({ where: { id } });
  }

  async createMeter(dto: Partial<Meter>) {
    // TODO: validation unicité serialNumber, index initial, etc.
    const meter = this.meterRepo.create(dto);
    return this.meterRepo.save(meter);
  }

  async updateMeter(id: string, dto: Partial<Meter>) {
    await this.meterRepo.update(id, dto);
    return this.meterRepo.findOne({ where: { id } });
  }

  async deleteMeter(id: string) {
    // Suppression logique : désactivation
    await this.meterRepo.update(id, { isActive: false });
    return { success: true };
  }

  public async deleteUserAssignments(dto: { userId: string; buildingIds?: string[]; apartmentIds?: string[] }) {
    const { userId, buildingIds = [], apartmentIds = [] } = dto;
    if (!userId || (buildingIds.length === 0 && apartmentIds.length === 0)) {
      return { success: false, message: 'userId et au moins un id requis' };
    }
    const deleteConditions = [];
    for (const buildingId of buildingIds) {
      deleteConditions.push({ userId, buildingId });
    }
    for (const apartmentId of apartmentIds) {
      deleteConditions.push({ userId, apartmentId });
    }
    let deleted = 0;
    for (const cond of deleteConditions) {
      const res = await this.userAssignmentRepo.delete(cond);
      deleted += res.affected || 0;
    }
    return { success: true, deleted };
  }

  async getUserAssignments(userId?: string) {
    if (!userId) {
      return {
        userId: '',
        assignedBuildings: [],
        assignedApartments: [],
        lastAssignmentUpdate: null,
      };
    }
    const assignments = await this.userAssignmentRepo.find({ where: { userId } });
    const assignedBuildings = assignments.filter(a => !!a.buildingId).map(a => a.buildingId);
    const assignedApartments = assignments.filter(a => !!a.apartmentId).map(a => a.apartmentId);
    const lastAssignmentUpdate = assignments.length
      ? new Date(Math.max(...assignments.map(a => a.updatedAt?.getTime?.() || 0))).toISOString()
      : null;
    return {
      userId,
      assignedBuildings,
      assignedApartments,
      lastAssignmentUpdate,
    };
  }

  async syncCatalog(params: SyncCatalogParams) {
    const { userId, lastSync } = params;
    
    // 1. Récupérer les assignments de l'utilisateur
    const assignments = await this.userAssignmentRepo.find({ where: { userId } });
    const buildingIds = assignments
      .filter(a => a.buildingId)
      .map(a => a.buildingId)
      .filter(Boolean) as string[];
    const apartmentIds = assignments
      .filter(a => a.apartmentId)
      .map(a => a.apartmentId)
      .filter(Boolean) as string[];

    // 2. Filtrer les buildings avec QueryBuilder pour support correct des conditions dynamiques
    let buildingQuery = this.buildingRepo.createQueryBuilder('building');
    if (buildingIds.length > 0) {
      buildingQuery = buildingQuery.where('building.id IN (:...buildingIds)', { buildingIds });
    } else {
      // Si pas d'assignments spécifiques, retourner un tableau vide
      buildingQuery = buildingQuery.where('1=0');
    }
    if (lastSync) {
      buildingQuery = buildingQuery.andWhere('building.updatedAt > :lastSync', { lastSync: new Date(lastSync) });
    }
    const buildings = await buildingQuery.getMany();

    // 3. Filtrer les apartments avec QueryBuilder
    let apartmentQuery = this.apartmentRepo.createQueryBuilder('apartment');
    if (apartmentIds.length > 0) {
      apartmentQuery = apartmentQuery.where('apartment.id IN (:...apartmentIds)', { apartmentIds });
    } else if (buildingIds.length > 0) {
      apartmentQuery = apartmentQuery.where('apartment.buildingId IN (:...buildingIds)', { buildingIds });
    } else {
      apartmentQuery = apartmentQuery.where('1=0');
    }
    if (lastSync) {
      apartmentQuery = apartmentQuery.andWhere('apartment.updatedAt > :lastSync', { lastSync: new Date(lastSync) });
    }
    const apartments = await apartmentQuery.getMany();

    // 4. Filtrer les meters liés aux apartments assignés
    let meterQuery = this.meterRepo.createQueryBuilder('meter');
    if (apartments.length > 0) {
      const meterApartmentIds = apartments.map(a => a.id);
      meterQuery = meterQuery.where('meter.apartmentId IN (:...apartmentIds)', { apartmentIds: meterApartmentIds });
    } else {
      meterQuery = meterQuery.where('1=0');
    }
    if (lastSync) {
      meterQuery = meterQuery.andWhere('meter.updatedAt > :lastSync', { lastSync: new Date(lastSync) });
    }
    const meters = await meterQuery.getMany();

    // 5. Sync timestamp = now
    const syncTimestamp = new Date().toISOString();
    const totalRecords = buildings.length + apartments.length + meters.length;

    return {
      buildings,
      apartments,
      meters,
      syncTimestamp,
      totalRecords,
    };
  }

  async createUserAssignments(dto: { userId: string; buildingIds?: string[]; apartmentIds?: string[]; assignedBy?: string }) {
    const { userId, buildingIds = [], apartmentIds = [], assignedBy } = dto;
    const assignments = [];
    for (const buildingId of buildingIds) {
      assignments.push(this.userAssignmentRepo.create({
        id: `${userId}_${buildingId}`,
        userId,
        buildingId,
        assignedBy,
      }));
    }
    for (const apartmentId of apartmentIds) {
      assignments.push(this.userAssignmentRepo.create({
        id: `${userId}_${apartmentId}`,
        userId,
        apartmentId,
        assignedBy,
      }));
    }
    await this.userAssignmentRepo.save(assignments);
    return { success: true, count: assignments.length };
  }
}
