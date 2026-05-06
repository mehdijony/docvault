// src/modules/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationEntity, NotificationType } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private notificationRepo: Repository<NotificationEntity>,
  ) {}

  async create(data: {
    type: NotificationType;
    title: string;
    message?: string;
    userId: string;
    organizationId: string;
    resourceId?: string;
    resourceType?: string;
    metadata?: Record<string, any>;
  }): Promise<NotificationEntity> {
    const notification = this.notificationRepo.create(data);
    return this.notificationRepo.save(notification);
  }

  async findByUser(userId: string, page = 1, limit = 20) {
    const [items, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total, page, limit };
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.notificationRepo.update({ id, userId }, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepo.update({ userId, isRead: false }, { isRead: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepo.count({
      where: { userId, isRead: false },
    });
  }
}