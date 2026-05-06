// apps/api/src/modules/audit/entities/audit-log.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  // Document actions
  DOCUMENT_UPLOAD = 'document.upload',
  DOCUMENT_DOWNLOAD = 'document.download',
  DOCUMENT_VIEW = 'document.view',
  DOCUMENT_DELETE = 'document.delete',
  DOCUMENT_SHARE = 'document.share',
  DOCUMENT_UPDATE = 'document.update',
  // User actions
  USER_LOGIN = 'user.login',
  USER_LOGOUT = 'user.logout',
  USER_INVITE = 'user.invite',
  USER_ROLE_CHANGE = 'user.role_change',
  // Org actions
  ORG_CREATED = 'org.created',
  ORG_SETTINGS_UPDATE = 'org.settings_update',
}

@Entity('audit_logs')
@Index(['organizationId', 'createdAt'])
@Index(['userId', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column()
  @Index()
  organizationId: string;

  @Column({ nullable: true })
  @Index()
  userId: string;

  @Column({ nullable: true })
  resourceId: string;

  @Column({ nullable: true })
  resourceType: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  // Kafka offset for replay capability
  @Column({ nullable: true })
  kafkaOffset: string;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}