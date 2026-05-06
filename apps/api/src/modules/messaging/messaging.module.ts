// apps/api/src/modules/messaging/messaging.module.ts
import { Module, Global } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';
import { KafkaService } from './kafka.service';

@Global()
@Module({
  providers: [RabbitmqService, KafkaService],
  exports: [RabbitmqService, KafkaService],
})
export class MessagingModule {}