import { Injectable, Optional } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';

export type User = { id: number; username: string; password: string; role: string };

@Injectable()
export class UsersService {
  // In-memory fallback for tests or when TypeORM not configured
  private users: User[] = [
    { id: 1, username: 'admin', password: 'password', role: 'admin' },
  ];

  constructor(
    @Optional()
    @InjectRepository(UserEntity)
    private readonly repo?: Repository<UserEntity>,
  ) {}

  async findByUsername(username: string): Promise<User | undefined> {
    if (this.repo) {
      return this.repo.findOne({ where: { username } }) as Promise<User | undefined>;
    }
    return this.users.find((u) => u.username === username);
  }

  // helper to create a user (used later for migrations/seeds)
  async create(user: Partial<User>): Promise<User> {
    if (this.repo) {
      const e = this.repo.create(user as any);
      const saved = await this.repo.save(e);
      return saved as unknown as User;
    }
    const id = this.users.length + 1;
    const newUser = { id, username: user.username!, password: user.password!, role: user.role || 'user' };
    this.users.push(newUser);
    return newUser;
  }
}
