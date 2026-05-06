// apps/api/src/modules/messaging/rabbitmq.service.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqp-connection-manager';
import { ChannelWrapper } from 'amqp-connection-manager';
import { Channel, ConsumeMessage } from 'amqplib';

export interface DocumentMessage {
  documentId: string;
  organizationId: string;
  userId: string;
  storagePath: string;
  mimeType: string;
  fileName: string;
}

export enum DocumentQueue {
  DOCUMENT_PROCESSING = 'document.processing',
  DOCUMENT_NOTIFICATIONS = 'document.notifications',
  DOCUMENT_CLEANUP = 'document.cleanup',
  DEAD_LETTER = 'document.dead_letter',
}

export enum DocumentExchange {
  DOCUMENTS = 'documents',
  DEAD_LETTER = 'documents.dlx',
}

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: amqp.AmqpConnectionManager;
  private publisherChannel: ChannelWrapper;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
    await this.setupTopology();
  }

  async onModuleDestroy() {
    await this.connection?.close();
  }

  private async connect() {
    const rabbitmqUrl = this.configService.get(
      'RABBITMQ_URL',
      'amqp://admin:admin@localhost:5672',
    );

    this.connection = amqp.connect([rabbitmqUrl], {
      reconnectTimeInSeconds: 5,
    });

    this.connection.on('connect', () =>
      this.logger.log('RabbitMQ connected'),
    );
    this.connection.on('disconnect', (err) =>
      this.logger.warn(`RabbitMQ disconnected: ${err.err?.message}`),
    );

    this.publisherChannel = this.connection.createChannel({
      json: true,
      setup: async (channel: Channel) => {
        await this.declareTopology(channel);
      },
    });
  }

  private async setupTopology() {
    await this.publisherChannel.waitForConnect();
    this.logger.log('RabbitMQ topology setup complete');
  }

  private async declareTopology(channel: Channel) {
    // Dead letter exchange
    await channel.assertExchange(DocumentExchange.DEAD_LETTER, 'direct', {
      durable: true,
    });

    // Main exchange
    await channel.assertExchange(DocumentExchange.DOCUMENTS, 'topic', {
      durable: true,
    });

    // Dead letter queue
    await channel.assertQueue(DocumentQueue.DEAD_LETTER, {
      durable: true,
    });
    await channel.bindQueue(
      DocumentQueue.DEAD_LETTER,
      DocumentExchange.DEAD_LETTER,
      '#',
    );

    const dlxArgs = {
      'x-dead-letter-exchange': DocumentExchange.DEAD_LETTER,
      'x-message-ttl': 86400000, // 24 hours
    };

    // Processing queue
    await channel.assertQueue(DocumentQueue.DOCUMENT_PROCESSING, {
      durable: true,
      arguments: dlxArgs,
    });
    await channel.bindQueue(
      DocumentQueue.DOCUMENT_PROCESSING,
      DocumentExchange.DOCUMENTS,
      'document.uploaded',
    );
    await channel.bindQueue(
      DocumentQueue.DOCUMENT_PROCESSING,
      DocumentExchange.DOCUMENTS,
      'document.updated',
    );

    // Notification queue
    await channel.assertQueue(DocumentQueue.DOCUMENT_NOTIFICATIONS, {
      durable: true,
      arguments: dlxArgs,
    });
    await channel.bindQueue(
      DocumentQueue.DOCUMENT_NOTIFICATIONS,
      DocumentExchange.DOCUMENTS,
      'document.shared',
    );
    await channel.bindQueue(
      DocumentQueue.DOCUMENT_NOTIFICATIONS,
      DocumentExchange.DOCUMENTS,
      'document.commented',
    );

    // Cleanup queue
    await channel.assertQueue(DocumentQueue.DOCUMENT_CLEANUP, {
      durable: true,
    });
    await channel.bindQueue(
      DocumentQueue.DOCUMENT_CLEANUP,
      DocumentExchange.DOCUMENTS,
      'document.deleted',
    );
  }

  async publishDocumentUploaded(message: DocumentMessage): Promise<void> {
    await this.publish('document.uploaded', message);
  }

  async publishDocumentShared(message: any): Promise<void> {
    await this.publish('document.shared', message);
  }

  async publishDocumentDeleted(message: any): Promise<void> {
    await this.publish('document.deleted', message);
  }

  private async publish(routingKey: string, message: any): Promise<void> {
    await this.publisherChannel.publish(
      DocumentExchange.DOCUMENTS,
      routingKey,
      message,
      {
        persistent: true,
        contentType: 'application/json',
        timestamp: Date.now(),
      },
    );
    this.logger.debug(`Published to ${routingKey}: ${JSON.stringify(message)}`);
  }

  // Subscribe to a queue
  createConsumer(
    queue: string,
    handler: (message: ConsumeMessage) => Promise<void>,
    prefetch = 10,
  ): ChannelWrapper {
    return this.connection.createChannel({
      setup: async (channel: Channel) => {
        await this.declareTopology(channel);
        await channel.prefetch(prefetch);
        await channel.consume(queue, async (msg) => {
          if (!msg) return;

          try {
            await handler(msg);
            channel.ack(msg);
          } catch (error) {
            this.logger.error(`Error processing message: ${error.message}`);
            // Nack and requeue if less than 3 attempts, else dead-letter
            const retryCount = (msg.properties.headers?.['x-retry-count'] || 0) as number;
            if (retryCount < 3) {
              channel.nack(msg, false, true);
            } else {
              channel.nack(msg, false, false);
            }
          }
        });
      },
    });
  }
}