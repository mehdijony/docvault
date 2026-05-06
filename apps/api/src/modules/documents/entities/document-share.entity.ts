// apps/api/src/modules/documents/entities/document-share.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Document } from './document.entity';
import { User } from '../../users/entities/user.entity';

export enum SharePermission {
  VIEW = 'view',
  DOWNLOAD = 'download',
  EDIT = 'edit',
}

@Entity('document_shares')
export class DocumentShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Unique share token for link sharing
  @Column({ unique: true })
  token: string;

  @Column({
    type: 'enum',
    enum: SharePermission,
    default: SharePermission.VIEW,
  })
  permission: SharePermission;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ default: false })
  isPublic: boolean;

  @Column({ default: 0 })
  accessCount: number;

  @Column({ nullable: true })
  maxAccessCount: number;

  @Column({ nullable: true })
  password: string;

  @ManyToOne(() => Document)
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Column()
  documentId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'sharedWithUserId' })
  sharedWithUser: User;

  @Column({ nullable: true })
  sharedWithUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;
}