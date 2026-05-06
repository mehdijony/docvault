// apps/api/src/modules/documents/entities/document-version.entity.ts
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

@Entity('document_versions')
export class DocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  versionNumber: number;

  @Column()
  storagePath: string;

  @Column({ type: 'bigint' })
  sizeBytes: number;

  @Column({ nullable: true })
  changeNote: string;

  @ManyToOne(() => Document, (doc) => doc.versions)
  @JoinColumn({ name: 'documentId' })
  document: Document;

  @Column()
  documentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: User;

  @Column()
  uploadedById: string;

  @CreateDateColumn()
  createdAt: Date;
}