import dataSource from '../data-source';
import { UserEntity } from '../src/modules/auth/entities/user.entity';

async function run() {
  const ds = await dataSource.initialize();
  try {
    const repo = ds.getRepository(UserEntity);
    const existing = await repo.findOne({ where: { username: 'admin' } });
    if (existing) {
      console.log('Admin user already exists:', { id: existing.id, username: existing.username });
    } else {
      const admin = repo.create({ username: 'admin', password: 'password', role: 'admin' } as any);
      const saved: any = await repo.save(admin);
      console.log('Created admin user:', { id: saved.id, username: saved.username });
    }
  } finally {
    await ds.destroy();
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
