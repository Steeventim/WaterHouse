import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('communication_logs')
export class CommunicationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  type: 'sms' | 'push' | 'email';

  @Column({ type: 'varchar', length: 50, nullable: true })
  @Index()
  provider: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  recipientId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recipientContact: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  @Index()
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';

  @Column({ type: 'varchar', length: 100, nullable: true })
  providerMessageId: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'datetime', nullable: true })
  sentAt: Date;

  @Column({ type: 'datetime', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'datetime', nullable: true })
  failedAt: Date;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cost: number;

  @Column({ type: 'simple-json', nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
