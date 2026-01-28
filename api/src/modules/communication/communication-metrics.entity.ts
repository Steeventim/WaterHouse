import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('communication_metrics')
export class CommunicationMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 20 })
  type: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  provider: string;

  @Column({ type: 'int', default: 0 })
  totalSent: number;

  @Column({ type: 'int', default: 0 })
  totalDelivered: number;

  @Column({ type: 'int', default: 0 })
  totalFailed: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  successRate: number;

  @CreateDateColumn()
  createdAt: Date;
}
