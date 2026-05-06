// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;

    // Skip logging for metrics endpoint (scraped every 15s — too noisy)
    if (url === '/metrics') {
      return next.handle();
    }

    const startTime = Date.now();
    const userId = request.user?.id || 'anonymous';

    this.logger.log(`→ ${method} ${url} | User: ${userId}`);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - startTime;
        this.logger.log(
          `← ${method} ${url} | ${response.statusCode} | ${duration}ms`,
        );
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `← ${method} ${url} | ERROR | ${duration}ms | ${error.message}`,
        );
        return throwError(() => error);
      }),
    );
  }
}
