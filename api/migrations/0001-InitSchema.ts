import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1700000000001 implements MigrationInterface {
  name = 'InitSchema1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // SQLite create table for users
    await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "username" varchar NOT NULL UNIQUE,
      "password" varchar NOT NULL,
      "role" varchar NOT NULL DEFAULT 'user'
    )`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }
}
