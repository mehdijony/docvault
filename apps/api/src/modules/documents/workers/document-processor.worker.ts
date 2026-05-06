// src/modules/documents/workers/document-processor.worker.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import type { ConsumeMessage } from 'amqplib';

import {
  RabbitmqService,
  DocumentQueue,
} from '../../messaging/rabbitmq.service';
import type { DocumentMessage } from '../../messaging/rabbitmq.service';
import { StorageService } from '../../storage/storage.service';
import { Document, DocumentStatus } from '../entities/document.entity';

@Injectable()
export class DocumentProcessorWorker implements OnModuleInit {
  private readonly logger = new Logger(DocumentProcessorWorker.name);

  constructor(
    @InjectRepository(Document)
    private documentRepo: Repository<Document>,
    private rabbitmqService: RabbitmqService,
    private storageService: StorageService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.rabbitmqService.createConsumer(
      DocumentQueue.DOCUMENT_PROCESSING,
      this.processDocument.bind(this),
      5,
    );
    this.logger.log('Document processor worker started');
  }

  private async processDocument(msg: ConsumeMessage): Promise<void> {
    const message: DocumentMessage = JSON.parse(msg.content.toString());
    this.logger.log(`Processing document: ${message.documentId}`);

    try {
      const bucket = this.configService.get(
        'MINIO_BUCKET_DOCUMENTS',
        'documents',
      );

      const updates: Partial<Document> = {
        status: DocumentStatus.READY,
      };

      if (message.mimeType.startsWith('image/')) {
        const thumbnailKey = this.storageService.generateThumbnailKey(
          message.organizationId,
          message.documentId,
        );

        // Download original from MinIO as Readable stream
        const fileStream = await this.storageService.getFileStream(
          bucket,
          message.storagePath,
        );

        // Collect stream into buffer
        const chunks: Buffer[] = [];
        for await (const chunk of fileStream) {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }
        const buffer = Buffer.concat(chunks);

        const thumbnail = await this.storageService.generateThumbnail(
          buffer,
          300,
          400,
        );

        await this.storageService.uploadFile(
          this.configService.get('MINIO_BUCKET_THUMBNAILS', 'thumbnails'),
          thumbnailKey,
          thumbnail,
          'image/webp',
        );

        updates.thumbnailPath = thumbnailKey;
      }

      await this.documentRepo.update(message.documentId, updates);
      this.logger.log(`Document ready: ${message.documentId}`);
    } catch (error) {
      this.logger.error(
        `Failed to process ${message.documentId}: ${error.message}`,
      );
      await this.documentRepo.update(message.documentId, {
        status: DocumentStatus.ERROR,
      });
      throw error;
    }
  }
}