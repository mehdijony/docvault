// src/common/interceptors/metrics.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('docvault_http_requests_total')
    private readonly requestCounter: Counter<string>,
    @InjectMetric('docvault_http_request_duration_seconds')
    private readonly requestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, route } = request;
    const routePath = route?.path || request.url;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const statusCode = response.statusCode.toString();
        const duration = (Date.now() - startTime) / 1000;

        this.requestCounter.inc({
          method,
          route: routePath,
          status_code: statusCode,
        });

        this.requestDuration.observe(
          { method, route: routePath, status_code: statusCode },
          duration,
        );
      }),
    );
  }
}