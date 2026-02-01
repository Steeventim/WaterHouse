import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Apartment } from './apartment.entity';

@Entity('meters')
@Index('idx_meters_apartment', ['apartmentId'])
@Index('idx_meters_type', ['type'])
@Index('idx_meters_serial', ['serialNumber'])
@Index('idx_meters_active', ['isActive'])
export class Meter {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  apartmentId: string;

  @ManyToOne(() => Apartment)
  @JoinColumn({ name: 'apartmentId' })
  apartment: Apartment;

  @Column({ type: 'varchar', length: 20 })
  type: string; // electricity, water, gas

  @Column({ type: 'varchar', length: 50, unique: true })
  serialNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0 })
  initialReading: number;

  @Column({ type: 'decimal', precision: 10, scale: 3, nullable: true })
  currentReading?: number;

  @Column({ type: 'timestamp', nullable: true })
  lastReadingDate?: Date;

  @Column({ type: 'timestamp', nullable: true })
  installationDate?: Date;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
