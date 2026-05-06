// src/modules/documents/documents.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentShare } from './entities/document-share.entity';
import { Folder } from './entities/folder.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentProcessorWorker } from './workers/document-processor.worker';
import { StorageModule } from '../storage/storage.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document, DocumentVersion, DocumentShare, Folder]),
    StorageModule,
    AuditModule,
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentProcessorWorker],
  exports: [DocumentsService],
})
export class DocumentsModule {}