// apps/api/src/modules/audit/audit.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

interface CreateAuditLogDto {
  action: AuditAction;
  organizationId: string;
  userId?: string;
  resourceId?: string;
  resourceType?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
  ) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLog> {
    const log = this.auditLogRepo.create(dto);
    return this.auditLogRepo.save(log);
  }

  async findByOrganization(
    organizationId: string,
    page = 1,
    limit = 50,
  ) {
    const [items, total] = await this.auditLogRepo.findAndCount({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { items, total, page, limit };
  }

  async findByResource(resourceId: string, organizationId: string) {
    return this.auditLogRepo.find({
      where: { resourceId, organizationId },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }
}