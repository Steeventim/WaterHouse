import dataSource from '../data-source';

async function run() {
  const ds = await dataSource.initialize();
  console.log('Running migrations...');
  await ds.runMigrations();
  console.log('Migrations complete');
  await ds.destroy();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
