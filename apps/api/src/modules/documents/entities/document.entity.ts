// apps/api/src/modules/documents/entities/document.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { DocumentVersion } from './document-version.entity';
import { Folder } from './folder.entity';

export enum DocumentStatus {
  PROCESSING = 'processing',
  READY = 'ready',
  ERROR = 'error',
  DELETED = 'deleted',
}

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  originalFilename: string;

  @Column()
  mimeType: string;

  @Column({ type: 'bigint' })
  sizeBytes: number;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PROCESSING,
  })
  status: DocumentStatus;

  // MinIO storage path
  @Column()
  storagePath: string;

  @Column({ nullable: true })
  thumbnailPath: string;

  // Full-text search vector
  @Column({ nullable: true, type: 'text' })
  extractedText: string;

  @Column({ type: 'tsvector', nullable: true, select: false })
  searchVector: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'int', default: 1 })
  currentVersion: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Organization, (org) => org.documents)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: string;

  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column()
  uploadedById: string;

  @ManyToOne(() => Folder, (folder) => folder.documents, { nullable: true })
  @JoinColumn({ name: 'folderId' })
  folder: Folder;

  @Column({ nullable: true })
  folderId: string;

  @OneToMany(() => DocumentVersion, (v) => v.document)
  versions: DocumentVersion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}