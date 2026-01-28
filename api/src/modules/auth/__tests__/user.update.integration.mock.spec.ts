import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ForbiddenException, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { AuthController } from '../auth.controller';
import { UsersService } from '../users.service';
import { JwtAuthGuard } from '../jwt-auth.guard';
import { AuthService } from '../auth.service';
import { UpdateUserDto } from '../dto/update-user.dto';

// Mock UsersService (in-memory)
class MockUsersService {
  private _users = [
    { id: 'admin', phoneNumber: '+225000000000', role: 'admin', name: 'Admin', isActive: true },
    { id: 'collector', phoneNumber: '+225000000001', role: 'collector', name: 'Collector', isActive: true },
  ];
  get allUsers() {
    return this._users;
  }
  async update(id: string, updates: Partial<any>) {
    const user = this._users.find(u => u.id === id);
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, updates);
    return user;
  }
}

// Mock JwtAuthGuard
class MockJwtAuthGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();
    // Simule l'utilisateur selon le header Authorization
    const token = req.headers['authorization']?.split(' ')[1];
    if (token === 'admin') req.user = { id: 'admin', role: 'admin' };
    else if (token === 'collector') req.user = { id: 'collector', role: 'collector' };
    else req.user = undefined;
    return true;
  }
}

// Mock AuthService (non utilisé ici)
class MockAuthService {}

describe('PATCH /auth/users/:id (integration, mock)', () => {
  let app: INestApplication;
  let usersService: MockUsersService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: UsersService, useClass: MockUsersService },
        { provide: AuthService, useClass: MockAuthService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
    usersService = moduleRef.get(UsersService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuse la modification pour collector', async () => {
    const res = await request(app.getHttpServer())
      .patch('/auth/users/admin')
      .set('Authorization', 'Bearer collector')
      .send({ name: 'Hacker' });
    expect(res.status).toBe(403);
  });

  it('modifie le nom et le rôle pour admin', async () => {
    const res = await request(app.getHttpServer())
      .patch('/auth/users/admin')
      .set('Authorization', 'Bearer admin')
      .send({ name: 'SuperAdmin', role: 'superadmin' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('SuperAdmin');
    expect(res.body.role).toBe('superadmin');
  });

  it('retourne 404 si id inconnu', async () => {
    const res = await request(app.getHttpServer())
      .patch('/auth/users/notfound')
      .set('Authorization', 'Bearer admin')
      .send({ name: 'X' });
    expect(res.status).toBe(404); // car le service throw NotFoundException
    expect(res.body.message).toMatch(/User not found/);
  });
});
