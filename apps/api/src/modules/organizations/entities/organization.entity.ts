// apps/api/src/modules/organizations/entities/organization.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Document } from '../../documents/entities/document.entity';

export enum OrganizationPlan {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
}

export enum OrganizationStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
}

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({
    type: 'enum',
    enum: OrganizationPlan,
    default: OrganizationPlan.FREE,
  })
  plan: OrganizationPlan;

  @Column({
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE,
  })
  status: OrganizationStatus;

  // Keycloak realm for this organization
  @Column({ unique: true })
  keycloakRealmId: string;

  // Storage settings
  @Column({ type: 'bigint', default: 5368709120 }) // 5GB default
  storageQuotaBytes: number;

  @Column({ type: 'bigint', default: 0 })
  storageUsedBytes: number;

  // MinIO bucket name for this org
  @Column({ unique: true })
  storageBucket: string;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>;

  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  @OneToMany(() => Document, (document) => document.organization)
  documents: Document[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}