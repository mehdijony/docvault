// apps/api/src/modules/messaging/kafka.service.ts
import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Kafka,
  Producer,
  Consumer,
  Admin,
  CompressionTypes,
  Partitioners,
} from 'kafkajs';

export enum KafkaTopic {
  DOCUMENT_EVENTS = 'document-events',
  USER_EVENTS = 'user-events',
  ORG_EVENTS = 'org-events',
}

export interface KafkaEvent {
  eventId: string;
  eventType: string;
  organizationId: string;
  userId: string;
  resourceId: string;
  resourceType: string;
  metadata: Record<string, any>;
  timestamp: string;
}

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private kafka: Kafka;
  private producer: Producer;
  private admin: Admin;
  private consumers: Consumer[] = [];

  constructor(private configService: ConfigService) {
  const brokers = configService
    .get('KAFKA_BROKERS', 'localhost:9092')
    .split(',')
    .map(b => b.trim());

  this.kafka = new Kafka({
    clientId: configService.get('KAFKA_CLIENT_ID', 'docvault-api'),
    brokers,
    // Retry config for slower startup
    retry: {
      initialRetryTime: 1000,
      retries: 10,
    },
    // Connection timeout
    connectionTimeout: 10000,
  });
}

  async onModuleInit() {
    this.admin = this.kafka.admin();
    await this.admin.connect();
    await this.ensureTopicsExist();

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: false,
      transactionTimeout: 30000,
      createPartitioner: Partitioners.LegacyPartitioner,
    });
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer?.disconnect();
    await Promise.all(this.consumers.map((c) => c.disconnect()));
    await this.admin?.disconnect();
  }

  private async ensureTopicsExist() {
    const topics = Object.values(KafkaTopic).map((topic) => ({
      topic,
      numPartitions: 3,
      replicationFactor: 1,
    }));

    const existingTopics = await this.admin.listTopics();
    const topicsToCreate = topics.filter(
      (t) => !existingTopics.includes(t.topic),
    );

    if (topicsToCreate.length > 0) {
      await this.admin.createTopics({ topics: topicsToCreate });
      this.logger.log(`Created Kafka topics: ${topicsToCreate.map((t) => t.topic).join(', ')}`);
    }
  }

  // Publish an audit event
  async publishEvent(topic: KafkaTopic, event: KafkaEvent): Promise<void> {
    await this.producer.send({
      topic,
      compression: CompressionTypes.GZIP,
      messages: [
        {
          key: event.organizationId,
          value: JSON.stringify(event),
          headers: {
            eventType: event.eventType,
            organizationId: event.organizationId,
          },
        },
      ],
    });
    this.logger.debug(`Published event: ${event.eventType} to ${topic}`);
  }

  // Publish document event
  async publishDocumentEvent(
    eventType: string,
    data: Omit<KafkaEvent, 'eventId' | 'eventType' | 'timestamp'>,
  ): Promise<void> {
    const event: KafkaEvent = {
      eventId: require('uuid').v4(),
      eventType,
      timestamp: new Date().toISOString(),
      ...data,
    };

    await this.publishEvent(KafkaTopic.DOCUMENT_EVENTS, event);
  }

  async publishUserEvent(
    eventType: string,
    data: Omit<KafkaEvent, 'eventId' | 'eventType' | 'timestamp'>,
  ): Promise<void> {
    const event: KafkaEvent = {
      eventId: require('uuid').v4(),
      eventType,
      timestamp: new Date().toISOString(),
      ...data,
    };

    await this.publishEvent(KafkaTopic.USER_EVENTS, event);
  }

  // Create a consumer
  async createConsumer(
    groupId: string,
    topics: KafkaTopic[],
    handler: (event: KafkaEvent, topic: string) => Promise<void>,
  ): Promise<void> {
    const consumer = this.kafka.consumer({ groupId });
    await consumer.connect();

    for (const topic of topics) {
      await consumer.subscribe({ topic, fromBeginning: false });
    }

    await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    try {
      // ↓ Add null check for message.value
      if (!message.value) {
        this.logger.warn(`Received empty Kafka message on topic ${topic}`);
        return;
      }

      const event = JSON.parse(message.value.toString()) as KafkaEvent;
      await handler(event, topic);
    } catch (error) {
      this.logger.error(
        `Error processing Kafka message on ${topic}: ${error.message}`,
      );
    }
  },
});

    this.consumers.push(consumer);
    this.logger.log(`Kafka consumer started for topics: ${topics.join(', ')}`);
  }
}