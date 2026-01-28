import { Entity, PrimaryColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('otp_requests')
@Index('idx_otp_requests_phone', ['phoneNumber'])
@Index('idx_otp_requests_request_id', ['requestId'])
@Index('idx_otp_requests_expires', ['expiresAt'])
export class OtpRequest {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 20 })
  phoneNumber: string;

  @Column({ type: 'varchar', length: 10 })
  otpCode: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  requestId: string;

  @Column({ type: 'datetime' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  isUsed: boolean;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @CreateDateColumn()
  createdAt: Date;
}
