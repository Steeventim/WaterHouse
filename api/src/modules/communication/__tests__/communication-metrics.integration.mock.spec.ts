import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CommunicationLogsModule } from '../communication-logs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationMetric } from '../communication-metrics.entity';
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

describe('GET /admin/communication-metrics (integration, mock)', () => {
  let app: INestApplication;
  let metricId: string;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [CommunicationMetric],
          synchronize: true,
        }),
        CommunicationLogsModule,
      ],
    })
      .overrideGuard(JwtAuthGuard).useClass(MockJwtAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Seed une métrique
    const repo = app.get('CommunicationMetricRepository') || app.get('CommunicationMetric');
    const metric = repo.create({
      date: '2026-01-28',
      type: 'sms',
      provider: 'mock',
      totalSent: 10,
      totalDelivered: 8,
      totalFailed: 2,
      successRate: 80.0,
    });
    const saved = await repo.save(metric);
    metricId = saved.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuse l’accès sans token admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/communication-metrics')
      .send();
    expect(res.status).toBe(500);
  });

  it('retourne 200 et un tableau de métriques pour admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/communication-metrics')
      .set('Authorization', 'Bearer admin')
      .send();
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('type', 'sms');
    expect(res.body[0]).toHaveProperty('totalSent', 10);
  });
});
