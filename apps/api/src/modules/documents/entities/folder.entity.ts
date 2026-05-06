// apps/api/src/modules/documents/entities/folder.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Document } from './document.entity';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  // Self-referential for nested folders
  @ManyToOne(() => Folder, (folder) => folder.children, { nullable: true })
  @JoinColumn({ name: 'parentId' })
  parent: Folder;

  @Column({ nullable: true })
  parentId: string;

  @OneToMany(() => Folder, (folder) => folder.parent)
  children: Folder[];

  @OneToMany(() => Document, (doc) => doc.folder)
  documents: Document[];

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy: User;

  @Column()
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}