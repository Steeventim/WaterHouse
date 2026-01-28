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
    if (token === 'manager') req.user = { id: 'manager-1', role: 'manager' };
    else if (token === 'admin') req.user = { id: 'admin', role: 'admin' };
    else req.user = undefined;
    return true;
  }
}

describe('GET /communication/my-history (integration, mock)', () => {
  let app: INestApplication;
  let logId: string;

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

    // Seed un log pour le manager
    const repo = app.get('CommunicationLogRepository') || app.get('CommunicationLog');
    const log = repo.create({
      type: 'sms',
      provider: 'mock',
      recipientId: 'manager-1',
      recipientContact: '+225000000002',
      content: 'Historique SMS',
      status: 'sent',
    });
    const saved = await repo.save(log);
    logId = saved.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuse l’accès sans token manager', async () => {
    const res = await request(app.getHttpServer())
      .get('/communication/my-history')
      .send();
    expect(res.status).toBe(500);
  });

  it('refuse l’accès pour admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/communication/my-history')
      .set('Authorization', 'Bearer admin')
      .send();
    expect(res.status).toBe(500);
  });

  it('retourne 200 et l’historique pour manager', async () => {
    const res = await request(app.getHttpServer())
      .get('/communication/my-history')
      .set('Authorization', 'Bearer manager')
      .send();
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('items');
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0]).toHaveProperty('content', 'Historique SMS');
  });
});
