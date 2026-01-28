import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserAndOtpRequest1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id varchar(50) PRIMARY KEY,
        phone_number varchar(20) UNIQUE NOT NULL,
        role varchar(20) NOT NULL DEFAULT 'collector',
        name varchar(100),
        is_active boolean DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX idx_users_phone ON users(phone_number);
      CREATE INDEX idx_users_active ON users(is_active);

      CREATE TABLE otp_requests (
        id varchar(50) PRIMARY KEY,
        phone_number varchar(20) NOT NULL,
        otp_code varchar(10) NOT NULL,
        request_id varchar(50) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used boolean DEFAULT false,
        attempts integer DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT chk_attempts CHECK (attempts <= 3)
      );
      CREATE INDEX idx_otp_requests_phone ON otp_requests(phone_number);
      CREATE INDEX idx_otp_requests_request_id ON otp_requests(request_id);
      CREATE INDEX idx_otp_requests_expires ON otp_requests(expires_at);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS otp_requests;
      DROP TABLE IF EXISTS users;
    `);
  }
}
