// src/config/database.config.ts
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Organization } from '../modules/organizations/entities/organization.entity';
import { User } from '../modules/users/entities/user.entity';
import { Document } from '../modules/documents/entities/document.entity';
import { DocumentVersion } from '../modules/documents/entities/document-version.entity';

import { Folder } from '../modules/documents/entities/folder.entity';
// ↓ Use the renamed entity class
import { NotificationEntity } from '../modules/notifications/entities/notification.entity';
import { AuditLog } from '../modules/audit/entities/audit-log.entity';
import { DocumentShare } from '../modules/documents/entities/document-share.entity';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get('POSTGRES_HOST', 'localhost'),
  port: configService.get<number>('POSTGRES_PORT', 5432),
  username: configService.get('POSTGRES_USER', 'postgres'),
  password: configService.get('POSTGRES_PASSWORD', 'postgres'),
  database: configService.get('POSTGRES_DB', 'docvault'),
  entities: [
    Organization,
    User,
    Document,
    DocumentVersion,
    DocumentShare,
    Folder,
    NotificationEntity,   // ← renamed from Notification
    AuditLog,
  ],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  ssl: false,
});