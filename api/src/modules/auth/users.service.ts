import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
    // Activation/désactivation en masse
    async batchSetActive(ids: string[], isActive: boolean) {
      if (this.repo) {
        const users = await this.repo.findByIds(ids);
        for (const user of users) {
          user.isActive = isActive;
          user.updatedAt = new Date();
        }
        await this.repo.save(users);
        return { success: true, count: users.length };
      }
      let count = 0;
      for (const id of ids) {
        const user = this.users.find(u => u.id === id);
        if (user) {
          user.isActive = isActive;
          user.updatedAt = new Date();
          count++;
        }
      }
      return { success: true, count };
    }

    // Pagination + recherche (in-memory ou repo)
    async paginateAndFilter({ page = 1, limit = 20, search, phone, name }: { page?: number; limit?: number; search?: string; phone?: string; name?: string }) {
      const pageNum = Math.max(1, page);
      const limitNum = Math.max(1, Math.min(100, limit));
      // Repo TypeORM
      if (this.repo) {
        const where: any = {};
        if (phone) where.phoneNumber = phone;
        if (name) where.name = name;
        // Recherche globale (nom ou téléphone)
        let qb = this.repo.createQueryBuilder('user');
        if (search) {
          qb = qb.where('user.name LIKE :search OR user.phoneNumber LIKE :search', { search: `%${search}%` });
        } else if (phone || name) {
          qb = qb.where(where);
        }
        const [items, total] = await qb
          .orderBy('user.createdAt', 'DESC')
          .skip((pageNum - 1) * limitNum)
          .take(limitNum)
          .getManyAndCount();
        return { items, total, page: pageNum, limit: limitNum };
      }
      // In-memory
      let all = this.users;
      if (search) {
        const s = search.toLowerCase();
        all = all.filter(u => (u.name?.toLowerCase().includes(s) || u.phoneNumber.includes(search)));
      }
      if (phone) {
        all = all.filter(u => u.phoneNumber === phone);
      }
      if (name) {
        all = all.filter(u => u.name === name);
      }
      const total = all.length;
      const items = all.slice((pageNum - 1) * limitNum, pageNum * limitNum);
      return { items, total, page: pageNum, limit: limitNum };
    }
  // In-memory fallback for tests or when TypeORM not configuré
  private users: User[] = [
    { id: 'admin', phoneNumber: '+225000000000', role: 'admin', name: 'Admin', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  constructor(
    @Optional()
    @InjectRepository(User)
    private readonly repo?: Repository<User>,
  ) {}

  // Pagination (in-memory ou repo)
  async paginate(page = 1, limit = 20): Promise<{ items: User[]; total: number; page: number; limit: number }> {
    const pageNum = Math.max(1, page);
    const limitNum = Math.max(1, Math.min(100, limit));
    if (this.repo) {
      const [items, total] = await this.repo.findAndCount({
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        order: { createdAt: 'DESC' },
      });
      return { items, total, page: pageNum, limit: limitNum };
    }
    const all = this.users;
    const total = all.length;
    const items = all.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    return { items, total, page: pageNum, limit: limitNum };
  }

  async findByPhoneNumber(phoneNumber: string): Promise<User | undefined> {
    if (this.repo) {
      return this.repo.findOne({ where: { phoneNumber } }) as Promise<User | undefined>;
    }
    return this.users.find((u) => u.phoneNumber === phoneNumber);
  }

  // helper to create a user (used later for migrations/seeds)
  async create(user: Partial<User>): Promise<User> {
    if (this.repo) {
      // Génère un id si absent
      if (!user.id) {
        user.id = randomUUID();
      }
      const e = this.repo.create(user);
      const saved = await this.repo.save(e);
      return saved;
    }
    if (!user.phoneNumber) {
      throw new Error('phoneNumber is required');
    }
    const id = user.id || `user_${this.users.length + 1}`;
    const newUser: User = {
      id: String(id),
      phoneNumber: user.phoneNumber,
      role: user.role || 'collector',
      name: user.name,
      isActive: user.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
  }

  async setActive(id: string, isActive: boolean): Promise<User> {
    if (this.repo) {
      const user = await this.repo.findOne({ where: { id } });
      if (!user) throw new Error('User not found');
      user.isActive = isActive;
      user.updatedAt = new Date();
      return this.repo.save(user);
    }
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    user.isActive = isActive;
    user.updatedAt = new Date();
    return user;
  }

  async delete(id: string): Promise<{ success: boolean }> {
    if (this.repo) {
      const user = await this.repo.findOne({ where: { id } });
      if (!user) throw new Error('User not found');
      await this.repo.remove(user);
      return { success: true };
    }
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');
    this.users.splice(idx, 1);
    return { success: true };
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    if (this.repo) {
      const user = await this.repo.findOne({ where: { id } });
      if (!user) throw new Error('User not found');
      Object.assign(user, updates);
      user.updatedAt = new Date();
      return this.repo.save(user);
    }
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    Object.assign(user, updates);
    user.updatedAt = new Date();
    return user;
  }

  // Expose users array for in-memory listing (test/dev only)
  get allUsers() {
    return this.users;
  }
}