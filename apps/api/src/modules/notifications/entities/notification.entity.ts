// src/modules/notifications/entities/notification.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum NotificationType {
  DOCUMENT_SHARED = 'document.shared',
  DOCUMENT_UPDATED = 'document.updated',
  DOCUMENT_COMMENTED = 'document.commented',
  USER_INVITED = 'user.invited',
  STORAGE_QUOTA_WARNING = 'storage.quota_warning',
}

@Entity('notifications')
@Index(['userId', 'createdAt'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: NotificationType })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ nullable: true })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ nullable: true })
  resourceId: string;

  @Column({ nullable: true })
  resourceType: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  @Index()
  userId: string;

  @Column()
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;
}