// CommonJS runner that loads the TypeScript data-source via the wrapper and runs migrations
(async () => {
  try {
    const dataSource = require('./data-source.cjs');
    const ds = await dataSource.initialize();
    console.log('Running migrations...');
    await ds.runMigrations();
    console.log('Migrations complete');
    await ds.destroy();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
