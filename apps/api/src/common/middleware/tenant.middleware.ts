// apps/api/src/common/middleware/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request & { tenantId?: string }, res: Response, next: NextFunction) {
    // Extract tenant from header or JWT claim
    const tenantId =
      req.headers['x-tenant-id'] as string ||
      (req as any).user?.organizationId;

    if (tenantId) {
      req.tenantId = tenantId;
    }

    next();
  }
}