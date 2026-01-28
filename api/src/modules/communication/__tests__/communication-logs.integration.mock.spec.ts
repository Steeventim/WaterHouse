import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CommunicationLogsModule } from '../communication-logs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationLog } from '../communication-log.entity';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

class MockJwtAuthGuard {
  canActivate(context) {
    const req = context.switchToHttp().getRequest();
    const token = req.headers['authorization']?.split(' ')[1];
    if (token === 'admin') req.user = { id: 'admin', role: 'admin' };
    else req.user = undefined;
    return true;
  }
}

describe('GET /admin/communication-logs (integration, mock)', () => {
  let app: INestApplication;

  beforeAll(async () => {

    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [CommunicationLog],
          synchronize: true,
        }),
        CommunicationLogsModule,
      ],
    })
      .overrideGuard(JwtAuthGuard).useClass(MockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuse l’accès sans token admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/communication-logs')
      .send();
    expect(res.status).toBe(500); // Erreur générique car pas d’admin
  });

  it('retourne 200 et un tableau paginé pour admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/communication-logs')
      .set('Authorization', 'Bearer admin')
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('page');
    expect(res.body).toHaveProperty('limit');
  });
});
