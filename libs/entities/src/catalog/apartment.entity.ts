import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { Building } from './building.entity';

@Entity('apartments')
@Index('idx_apartments_building', ['buildingId'])
@Index('idx_apartments_tenant', ['tenantName'])
export class Apartment {
	@PrimaryColumn({ type: 'varchar', length: 50 })
	id: string;

	@Column({ type: 'varchar', length: 50 })
	buildingId: string;

	@ManyToOne(() => Building)
	@JoinColumn({ name: 'buildingId' })
	building: Building;

	@Column({ type: 'varchar', length: 20 })
	number: string;

	@Column({ type: 'int', nullable: true })
	floor?: number;

	@Column({ type: 'varchar', length: 100, nullable: true })
	tenantName?: string;

	@Column({ type: 'varchar', length: 20, nullable: true })
	tenantPhone?: string;

	@Column({ type: 'varchar', length: 100, nullable: true })
	tenantEmail?: string;

	@Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
	surfaceArea?: number;

	@Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
	rentAmount?: number;

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updatedAt: Date;
}