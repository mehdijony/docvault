// src/modules/storage/storage.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import sharp from 'sharp';                          // ← default import, not namespace
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);
  private client: Minio.Client;

  constructor(private configService: ConfigService) {
    this.client = new Minio.Client({
      endPoint: configService.get('MINIO_ENDPOINT', 'localhost'),
      port: configService.get<number>('MINIO_PORT', 9000),
      useSSL: configService.get('MINIO_USE_SSL') === 'true',
      accessKey: configService.get('MINIO_ROOT_USER', 'minioadmin'),
      secretKey: configService.get('MINIO_ROOT_PASSWORD', 'minioadmin'),
    });
  }

  async onModuleInit() {
    await this.ensureBucketsExist();
  }

  private async ensureBucketsExist() {
    const buckets = [
      this.configService.get('MINIO_BUCKET_DOCUMENTS', 'documents'),
      this.configService.get('MINIO_BUCKET_THUMBNAILS', 'thumbnails'),
      'temp',
    ];

    for (const bucket of buckets) {
      try {
        const exists = await this.client.bucketExists(bucket);
        if (!exists) {
          await this.client.makeBucket(bucket);
          this.logger.log(`Created bucket: ${bucket}`);
        }
      } catch (err) {
        this.logger.warn(`Could not check/create bucket ${bucket}: ${err.message}`);
      }
    }
  }

  async uploadFile(
    bucket: string,
    key: string,
    buffer: Buffer,
    mimeType: string,
    metadata?: Record<string, string>,
  ): Promise<{ key: string; bucket: string; etag: string }> {
    const result = await this.client.putObject(
      bucket,
      key,
      buffer,
      buffer.length,
      { 'Content-Type': mimeType, ...metadata },
    );

    return { key, bucket, etag: result.etag };
  }

  // ↓ Fixed: use Readable from 'stream' instead of ReadableStream
  async uploadStream(
    bucket: string,
    key: string,
    stream: Readable,
    size: number,
    mimeType: string,
  ): Promise<{ key: string; bucket: string; etag: string }> {
    const result = await this.client.putObject(
      bucket,
      key,
      stream,
      size,
      { 'Content-Type': mimeType },
    );

    return { key, bucket, etag: result.etag };
  }

  async getPresignedUrl(
    bucket: string,
    key: string,
    expirySeconds = 3600,
  ): Promise<string> {
    return this.client.presignedGetObject(bucket, key, expirySeconds);
  }

  async getPresignedUploadUrl(
    bucket: string,
    key: string,
    expirySeconds = 3600,
  ): Promise<string> {
    return this.client.presignedPutObject(bucket, key, expirySeconds);
  }

  generateDocumentKey(
    organizationId: string,
    documentId: string,
    filename: string,
    version = 1,
  ): string {
    return `org-${organizationId}/documents/${documentId}/v${version}/${filename}`;
  }

  generateThumbnailKey(organizationId: string, documentId: string): string {
    return `org-${organizationId}/thumbnails/${documentId}/thumb.webp`;
  }

  // ↓ Fixed: use default import sharp, not namespace
  async generateThumbnail(
    imageBuffer: Buffer,
    width = 300,
    height = 400,
  ): Promise<Buffer> {
    return sharp(imageBuffer)
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    await this.client.removeObject(bucket, key);
  }

  async deleteFiles(bucket: string, keys: string[]): Promise<void> {
    await this.client.removeObjects(bucket, keys);
  }

  async getFileStats(bucket: string, key: string) {
    return this.client.statObject(bucket, key);
  }

  async getFileStream(bucket: string, key: string): Promise<Readable> {
    return this.client.getObject(bucket, key);
  }

  // ↓ Fixed: ObjectInfo type and proper typing
  async listFiles(bucket: string, prefix: string): Promise<string[]> {
    const keys: string[] = [];

    return new Promise((resolve, reject) => {
      const stream = this.client.listObjects(bucket, prefix, true);
      stream.on('data', (obj) => {
        if (obj.name) keys.push(obj.name);
      });
      stream.on('error', reject);
      stream.on('end', () => resolve(keys));
    });
  }
}