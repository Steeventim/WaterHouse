import { DataSource } from 'typeorm';
import { UserEntity } from './src/modules/auth/entities/user.entity';

const options: any = {
  type: 'sqlite',
  database: process.env.DB_PATH || 'data/sqlite.db',
  entities: [UserEntity],
  migrations: ['api/migrations/*{.ts,.js}'],
};

const dataSource = new DataSource(options);

export default dataSource;

// CLI helper: `node ./api/scripts/run-migrations.js` will call dataSource.initialize() and run migrations
