// apps/api/src/modules/audit/audit.consumer.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { KafkaService, KafkaTopic, KafkaEvent } from '../messaging/kafka.service';
import { AuditService } from './audit.service';
import { AuditAction } from './entities/audit-log.entity';

@Injectable()
export class AuditConsumer implements OnModuleInit {
  private readonly logger = new Logger(AuditConsumer.name);

  constructor(
    private kafkaService: KafkaService,
    private auditService: AuditService,
  ) {}

  async onModuleInit() {
    await this.kafkaService.createConsumer(
      'audit-consumer-group',
      [KafkaTopic.DOCUMENT_EVENTS, KafkaTopic.USER_EVENTS, KafkaTopic.ORG_EVENTS],
      this.handleEvent.bind(this),
    );
    this.logger.log('Audit consumer started');
  }

  private async handleEvent(event: KafkaEvent, topic: string): Promise<void> {
    try {
      await this.auditService.log({
        action: event.eventType as AuditAction,
        organizationId: event.organizationId,
        userId: event.userId,
        resourceId: event.resourceId,
        resourceType: event.resourceType,
        metadata: {
          ...event.metadata,
          kafkaTopic: topic,
          eventId: event.eventId,
        },
      });
    } catch (error) {
      this.logger.error(`Failed to persist audit event: ${error.message}`);
    }
  }
}