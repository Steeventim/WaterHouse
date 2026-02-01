import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from './catalog.module';
import { Building, Apartment, Meter, UserAssignment } from 'entities';
import { Repository } from 'typeorm';

describe('CatalogController (e2e)', () => {
	let app: INestApplication;
	let userAssignmentRepo: Repository<UserAssignment>;

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [
				TypeOrmModule.forRoot({
					type: 'sqlite',
					database: ':memory:',
					dropSchema: true,
					entities: [Building, Apartment, Meter, UserAssignment],
					synchronize: true,
				}),
				CatalogModule,
			],
		}).compile();
		app = moduleFixture.createNestApplication();
		await app.init();
		userAssignmentRepo = moduleFixture.get(getRepositoryToken(UserAssignment));
	});

	afterAll(async () => {
		await app.close();
	});

	it('POST /api/v1/catalog/user-assignments crée des assignments', async () => {
		const res = await request(app.getHttpServer())
			.post('/api/v1/catalog/user-assignments')
			.send({ userId: 'u1', buildingIds: ['b1'], apartmentIds: ['a1'], assignedBy: 'admin' });
		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		expect(res.body.count).toBe(2);
		const assignments = await userAssignmentRepo.find({ where: { userId: 'u1' } });
		expect(assignments.length).toBe(2);
	});

	it('GET /api/v1/catalog/user-assignments retourne les assignments', async () => {
		await userAssignmentRepo.save([
			userAssignmentRepo.create({ id: 'u2_b2', userId: 'u2', buildingId: 'b2', assignedBy: 'admin' }),
			userAssignmentRepo.create({ id: 'u2_a2', userId: 'u2', apartmentId: 'a2', assignedBy: 'admin' }),
		]);
		const res = await request(app.getHttpServer())
			.get('/api/v1/catalog/user-assignments?userId=u2');
		expect(res.status).toBe(200);
		expect(res.body.userId).toBe('u2');
		expect(res.body.assignedBuildings).toContain('b2');
		expect(res.body.assignedApartments).toContain('a2');
	});

	it('DELETE /api/v1/catalog/user-assignments supprime les assignments', async () => {
		await userAssignmentRepo.save([
			userAssignmentRepo.create({ id: 'u3_b3', userId: 'u3', buildingId: 'b3', assignedBy: 'admin' }),
			userAssignmentRepo.create({ id: 'u3_a3', userId: 'u3', apartmentId: 'a3', assignedBy: 'admin' }),
		]);
		const res = await request(app.getHttpServer())
			.delete('/api/v1/catalog/user-assignments')
			.send({ userId: 'u3', buildingIds: ['b3'], apartmentIds: ['a3'] });
		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.deleted).toBe(2);
		const assignments = await userAssignmentRepo.find({ where: { userId: 'u3' } });
		expect(assignments.length).toBe(0);
	});
});