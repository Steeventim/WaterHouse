import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { CommunicationLogsModule } from '../communication-logs.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunicationLog } from '../communication-log.entity';
import { EncryptionService } from '../../../common/encryption.service';
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

describe('GET /admin/communication-logs/export (integration, mock)', () => {
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

    // Seed un log
    const repo = app.get('CommunicationLogRepository') || app.get('CommunicationLog');
    // Chiffre le contenu
    const encrypted = EncryptionService.encrypt('Export SMS');
    const log = repo.create({
      type: 'sms',
      provider: 'mock',
      recipientId: 'user-1',
      recipientContact: '+225000000000',
      content: encrypted.cipherText,
      contentIv: encrypted.iv,
      contentTag: encrypted.tag,
      status: 'sent',
    });
    const saved = await repo.save(log);
    logId = saved.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('refuse l’accès sans token admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/communication-logs/export')
      .send();
    expect(res.status).toBe(500);
  });

  it('retourne un CSV pour admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/communication-logs/export?format=csv')
      .set('Authorization', 'Bearer admin')
      .buffer()
      .parse((res, cb) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => cb(null, data));
      });
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toMatch(/text\/csv/);
    expect(res.header['content-disposition']).toMatch(/attachment/);
    expect(res.body).toMatch(/Export SMS/);
  });

  it('retourne un tableau JSON pour admin', async () => {
    const res = await request(app.getHttpServer())
      .get('/admin/communication-logs/export?format=json')
      .set('Authorization', 'Bearer admin')
      .send();
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('content', 'Export SMS');
  });
});
