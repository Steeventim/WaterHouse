"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitSchema1700000000001 = void 0;
class InitSchema1700000000001 {
    constructor() {
        this.name = 'InitSchema1700000000001';
    }
    async up(queryRunner) {
        // SQLite create table for users
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "users" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "username" varchar NOT NULL UNIQUE,
      "password" varchar NOT NULL,
      "role" varchar NOT NULL DEFAULT 'user'
    )`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    }
}
exports.InitSchema1700000000001 = InitSchema1700000000001;
