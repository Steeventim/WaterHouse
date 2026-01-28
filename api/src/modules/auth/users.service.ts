import { Injectable, Optional, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { User } from './entities/user.entity';
import { randomUUID } from 'crypto';
import { EncryptionService } from '../../common/encryption.service';

interface PaginationOptions {
  page?: number;
  limit?: number;
}

interface UserFilters extends PaginationOptions {
  search?: string;
  phone?: string;
  name?: string;
}

interface EncryptedField {
  cipherText: string;
  iv: string;
  tag: string;
}

@Injectable()
export class UsersService {
  private readonly DEFAULT_PAGE = 1;
  private readonly DEFAULT_LIMIT = 20;
  private readonly MAX_LIMIT = 100;
  private readonly ADMIN_USER_ID = 'admin';

  // In-memory fallback pour tests
  private users: User[] = [this.createDefaultAdmin()];

  constructor(
    @Optional()
    @InjectRepository(User)
    private readonly repo?: Repository<User>, @Optional()  // Ajoutez ceci
    private readonly encryptionService: EncryptionService,
  ) {}

  // ==================== Public API ====================

  async paginate(options: PaginationOptions = {}): Promise<PaginatedResult<User>> {
    const { page, limit } = this.normalizePagination(options);
    
    if (this.isRepoMode()) {
      return this.paginateWithRepo(page, limit);
    }
    return this.paginateInMemory(page, limit);
  }

  async paginateAndFilter(filters: UserFilters = {}): Promise<PaginatedResult<User>> {
    const { page, limit, search, phone, name } = filters;
    const normalized = this.normalizePagination({ page, limit });

    if (this.isRepoMode()) {
      return this.filterWithRepo(normalized, { search, phone, name });
    }
    return this.filterInMemory(normalized, { search, phone, name });
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | null> {
    if (this.isRepoMode()) {
      return this.repo.findOne({ where: { phoneNumber } });
    }
    return this.users.find(u => u.phoneNumber === phoneNumber) || null;
  }

  async findById(id: string): Promise<User | null> {
    if (this.isRepoMode()) {
      return this.repo.findOne({ where: { id } });
    }
    return this.users.find(u => u.id === id) || null;
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.initializeUser(userData);
    
    if (this.isRepoMode()) {
      return this.repo.save(user);
    }
    this.users.push(user);
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);

    this.applyUpdates(user, updates);
    
    if (this.isRepoMode()) {
      return this.repo.save(user);
    }
    return user;
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    return this.update(id, { isActive, updatedAt: new Date() });
  }

  async batchSetActive(ids: string[], isActive: boolean): Promise<BatchResult> {
    if (this.isRepoMode()) {
      const users = await this.repo.findByIds(ids);
      users.forEach(user => {
        user.isActive = isActive;
        user.updatedAt = new Date();
      });
      await this.repo.save(users);
      return { success: true, count: users.length };
    }

    const updated = ids.reduce((count, id) => {
      const user = this.users.find(u => u.id === id);
      if (user) {
        user.isActive = isActive;
        user.updatedAt = new Date();
        return count + 1;
      }
      return count;
    }, 0);

    return { success: true, count: updated };
  }

  async delete(id: string): Promise<{ success: boolean }> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException(`User ${id} not found`);

    if (this.isRepoMode()) {
      await this.repo.remove(user);
    } else {
      this.users = this.users.filter(u => u.id !== id);
    }
    
    return { success: true };
  }

  get allUsers(): User[] {
    return this.users;
  }

  // ==================== Private Helpers ====================

  private isRepoMode(): boolean {
    return !!this.repo;
  }

  private normalizePagination({ page = this.DEFAULT_PAGE, limit = this.DEFAULT_LIMIT }: PaginationOptions) {
    return {
      page: Math.max(1, page),
      limit: Math.max(1, Math.min(this.MAX_LIMIT, limit)),
    };
  }

  private createDefaultAdmin(): User {
    const u = new User();
    u.id = this.ADMIN_USER_ID;
    u.phoneNumber = '+225000000000';
    u.role = 'admin';
    u.name = 'Admin';
    u.plainName = 'Admin';
    u.plainPhone = '+225000000000';
    u.isActive = true;
    u.createdAt = new Date();
    u.updatedAt = new Date();
    return u;
  }

  private initializeUser(data: Partial<User>): User {
    const user = new User();
    user.id = data.id || randomUUID();
    user.role = data.role || 'collector';
    user.isActive = data.isActive ?? true;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    if (!data.phoneNumber) {
      throw new Error('phoneNumber is required');
    }

    // Chiffrement des champs sensibles
    if (data.name) {
      Object.assign(user, this.encryptField(data.name, 'name'));
      user.plainName = data.name;
    }

    if (data.phoneNumber) {
      Object.assign(user, this.encryptField(data.phoneNumber, 'phone'));
      user.plainPhone = data.phoneNumber;
    }

    return user;
  }

  private applyUpdates(user: User, updates: Partial<User>): void {
    Object.assign(user, updates);
    user.updatedAt = new Date();

    // Re-chiffrer si les valeurs claires changent
    if (updates.name) {
      Object.assign(user, this.encryptField(updates.name, 'name'));
      user.plainName = updates.name;
    }

    if (updates.phoneNumber) {
      Object.assign(user, this.encryptField(updates.phoneNumber, 'phone'));
      user.plainPhone = updates.phoneNumber;
    }
  }

  private encryptField(value: string, prefix: 'name' | 'phone'): Record<string, string> {
    const encrypted = this.encryptionService.encrypt(value);
    return {
      [prefix]: encrypted.cipherText,
      [`${prefix}_iv`]: encrypted.iv,
      [`${prefix}_tag`]: encrypted.tag,
    };
  }

  // ==================== Repository Strategies ====================

  private async paginateWithRepo(page: number, limit: number): Promise<PaginatedResult<User>> {
    const [items, total] = await this.repo.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, limit };
  }

  private paginateInMemory(page: number, limit: number): PaginatedResult<User> {
    const total = this.users.length;
    const items = this.users.slice((page - 1) * limit, page * limit);
    return { items, total, page, limit };
  }

  private async filterWithRepo(
    { page, limit }: { page: number; limit: number },
    { search, phone, name }: { search?: string; phone?: string; name?: string }
  ): Promise<PaginatedResult<User>> {
    let qb = this.repo.createQueryBuilder('user');

    if (search) {
      qb = qb.where(
        new Brackets(qbInner => {
          qbInner.where('user.name LIKE :search', { search: `%${search}%` })
                 .orWhere('user.phoneNumber LIKE :search', { search: `%${search}%` });
        })
      );
    } else {
      if (phone) qb = qb.andWhere('user.phoneNumber = :phone', { phone });
      if (name) qb = qb.andWhere('user.name = :name', { name });
    }

    const [items, total] = await qb
      .orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  private filterInMemory(
    { page, limit }: { page: number; limit: number },
    { search, phone, name }: { search?: string; phone?: string; name?: string }
  ): PaginatedResult<User> {
    let filtered = [...this.users];

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(u => 
        u.name?.toLowerCase().includes(s) || 
        u.phoneNumber?.includes(search)
      );
    }

    if (phone) {
      filtered = filtered.filter(u => u.phoneNumber === phone);
    }

    if (name) {
      filtered = filtered.filter(u => u.name === name);
    }

    const total = filtered.length;
    const items = filtered.slice((page - 1) * limit, page * limit);
    
    return { items, total, page, limit };
  }
}

// ==================== Types ====================

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

interface BatchResult {
  success: boolean;
  count: number;
}