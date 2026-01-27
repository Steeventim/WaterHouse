const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/sqlite.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open DB', err);
    process.exit(1);
  }
});

const sql = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  username VARCHAR NOT NULL UNIQUE,
  password VARCHAR NOT NULL,
  role VARCHAR NOT NULL DEFAULT 'user'
);`;

db.serialize(() => {
  db.run(sql, (err) => {
    if (err) {
      console.error('Migration failed:', err);
      process.exit(1);
    }
    console.log('Migration applied: users table ensured');
    db.close();
  });
});
