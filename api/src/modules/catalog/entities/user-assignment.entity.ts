import { Entity, PrimaryColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Building } from './building.entity';
import { Apartment } from './apartment.entity';

@Entity('user_assignments')
@Index('idx_assignments_user', ['userId'])
@Index('idx_assignments_building', ['buildingId'])
@Index('idx_assignments_apartment', ['apartmentId'])
export class UserAssignment {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 50 })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'varchar', length: 50, nullable: true })
  buildingId?: string;

  @ManyToOne(() => Building, { nullable: true })
  @JoinColumn({ name: 'buildingId' })
  building?: Building;

  @Column({ type: 'varchar', length: 50, nullable: true })
  apartmentId?: string;

  @ManyToOne(() => Apartment, { nullable: true })
  @JoinColumn({ name: 'apartmentId' })
  apartment?: Apartment;

  @CreateDateColumn({ type: 'timestamp' })
  assignedAt: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  assignedBy?: string;
}
