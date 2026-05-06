// src/modules/documents/documents.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';    // ← ADD THIS
import { v4 as uuidv4 } from 'uuid';

import { Document, DocumentStatus } from './entities/document.entity';
import { DocumentVersion } from './entities/document-version.entity';
import { DocumentShare, SharePermission } from './entities/document-share.entity';
import { StorageService } from '../storage/storage.service';
import { RabbitmqService } from '../messaging/rabbitmq.service';
import { KafkaService } from '../messaging/kafka.service';
import { AuditService } from '../audit/audit.service';
import {
  UploadDocumentDto,
  UpdateDocumentDto,
  SearchDocumentsDto,
} from './dto/upload-document.dto';
import { AuditAction } from '../audit/entities/audit-log.entity';
import type { JwtUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    @InjectRepository(DocumentVersion)
    private versionRepo: Repository<DocumentVersion>,
    @InjectRepository(DocumentShare)
    private shareRepo: Repository<DocumentShare>,
    private storageService: StorageService,
    private rabbitmqService: RabbitmqService,
    private kafkaService: KafkaService,
    private auditService: AuditService,
    private dataSource: DataSource,
    private configService: ConfigService,           // ← ADD THIS
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    dto: UploadDocumentDto,
    user: JwtUser,
  ): Promise<Document> {
    const documentId = uuidv4();
    const bucket = this.configService.get(
      'MINIO_BUCKET_DOCUMENTS',
      'documents',
    );

    const storageKey = this.storageService.generateDocumentKey(
      user.organizationId,
      documentId,
      file.originalname,
      1,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.storageService.uploadFile(
        bucket,
        storageKey,
        file.buffer,
        file.mimetype,
        {
          'x-organization-id': user.organizationId,
          'x-uploaded-by': user.id,
        },
      );

      const document = queryRunner.manager.create(Document, {
        id: documentId,
        name: dto.name,
        description: dto.description,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        sizeBytes: file.size,
        storagePath: storageKey,
        status: DocumentStatus.PROCESSING,
        tags: dto.tags || [],
        folderId: dto.folderId,
        organizationId: user.organizationId,
        uploadedById: user.id,
        currentVersion: 1,
      });

      const savedDocument = await queryRunner.manager.save(Document, document);

      await queryRunner.manager.save(DocumentVersion, {
        documentId: savedDocument.id,
        versionNumber: 1,
        storagePath: storageKey,
        sizeBytes: file.size,
        uploadedById: user.id,
      });

      await queryRunner.commitTransaction();

      await this.rabbitmqService.publishDocumentUploaded({
        documentId: savedDocument.id,
        organizationId: user.organizationId,
        userId: user.id,
        storagePath: storageKey,
        mimeType: file.mimetype,
        fileName: file.originalname,
      });

      await this.kafkaService.publishDocumentEvent(
        AuditAction.DOCUMENT_UPLOAD,
        {
          organizationId: user.organizationId,
          userId: user.id,
          resourceId: savedDocument.id,
          resourceType: 'document',
          metadata: {
            fileName: file.originalname,
            fileSize: file.size,
            mimeType: file.mimetype,
          },
        },
      );

      await this.auditService.log({
        action: AuditAction.DOCUMENT_UPLOAD,
        organizationId: user.organizationId,
        userId: user.id,
        resourceId: savedDocument.id,
        resourceType: 'document',
        metadata: { fileName: file.originalname },
      });

      return savedDocument;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      try {
        await this.storageService.deleteFile(bucket, storageKey);
      } catch (cleanupError) {
        this.logger.error(`Cleanup failed: ${cleanupError.message}`);
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(organizationId: string, dto: SearchDocumentsDto) {
    const qb = this.documentRepo
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.uploadedBy', 'user')
      .leftJoinAndSelect('doc.folder', 'folder')
      .where('doc.organizationId = :organizationId', { organizationId })
      .andWhere('doc.status != :deleted', { deleted: DocumentStatus.DELETED });

    if (dto.query) {
      qb.andWhere(
        `(doc.name ILIKE :query OR doc.description ILIKE :query)`,
        { query: `%${dto.query}%` },
      );
    }

    if (dto.folderId) {
      qb.andWhere('doc.folderId = :folderId', { folderId: dto.folderId });
    }

    if (dto.tags && dto.tags.length > 0) {
      qb.andWhere('doc.tags && :tags', { tags: dto.tags });
    }

    const page = dto.page || 1;
    const limit = Math.min(dto.limit || 20, 100);

    const [items, total] = await qb
      .orderBy('doc.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string, organizationId: string): Promise<Document> {
    const document = await this.documentRepo.findOne({
      where: { id, organizationId },
      relations: ['uploadedBy', 'folder', 'versions'],
    });
    if (!document) throw new NotFoundException(`Document ${id} not found`);
    return document;
  }

  async getDownloadUrl(id: string, user: JwtUser, expirySeconds = 3600) {
    const document = await this.findById(id, user.organizationId);

    if (document.status !== DocumentStatus.READY) {
      throw new BadRequestException('Document is not ready for download');
    }

    const url = await this.storageService.getPresignedUrl(
      this.configService.get('MINIO_BUCKET_DOCUMENTS', 'documents'),
      document.storagePath,
      expirySeconds,
    );

    await this.auditService.log({
      action: AuditAction.DOCUMENT_DOWNLOAD,
      organizationId: user.organizationId,
      userId: user.id,
      resourceId: id,
      resourceType: 'document',
    });

    return url;
  }

  async update(
    id: string,
    dto: UpdateDocumentDto,
    user: JwtUser,
  ): Promise<Document> {
    const document = await this.findById(id, user.organizationId);

    if (
      user.role === UserRole.VIEWER ||
      (user.role === UserRole.EDITOR && document.uploadedById !== user.id)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    Object.assign(document, dto);
    const updated = await this.documentRepo.save(document);

    await this.auditService.log({
      action: AuditAction.DOCUMENT_UPDATE,
      organizationId: user.organizationId,
      userId: user.id,
      resourceId: id,
      resourceType: 'document',
      metadata: { changes: dto },
    });

    return updated;
  }

  async createShareLink(
    documentId: string,
    dto: {
      permission: SharePermission;
      expiresAt?: Date;
      maxAccessCount?: number;
      isPublic?: boolean;
    },
    user: JwtUser,
  ): Promise<DocumentShare> {
    const document = await this.findById(documentId, user.organizationId);

    const share = this.shareRepo.create({
      token: uuidv4(),
      documentId: document.id,
      permission: dto.permission,
      expiresAt: dto.expiresAt,
      maxAccessCount: dto.maxAccessCount,
      isPublic: dto.isPublic || false,
      createdById: user.id,
    });

    const savedShare = await this.shareRepo.save(share);

    await this.rabbitmqService.publishDocumentShared({
      documentId: document.id,
      documentName: document.name,
      shareToken: savedShare.token,
      organizationId: user.organizationId,
      sharedById: user.id,
    });

    await this.auditService.log({
      action: AuditAction.DOCUMENT_SHARE,
      organizationId: user.organizationId,
      userId: user.id,
      resourceId: documentId,
      resourceType: 'document',
      metadata: { shareToken: savedShare.token, permission: dto.permission },
    });

    return savedShare;
  }

  async softDelete(id: string, user: JwtUser): Promise<void> {
    const document = await this.findById(id, user.organizationId);

    if (
      user.role === UserRole.VIEWER ||
      (user.role === UserRole.EDITOR && document.uploadedById !== user.id)
    ) {
      throw new ForbiddenException('Insufficient permissions');
    }

    await this.documentRepo.update(id, { status: DocumentStatus.DELETED });

    await this.rabbitmqService.publishDocumentDeleted({
      documentId: id,
      storagePath: document.storagePath,
      thumbnailPath: document.thumbnailPath,
      organizationId: user.organizationId,
    });

    await this.auditService.log({
      action: AuditAction.DOCUMENT_DELETE,
      organizationId: user.organizationId,
      userId: user.id,
      resourceId: id,
      resourceType: 'document',
    });
  }
}