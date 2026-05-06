// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    const error =
      typeof exceptionResponse === 'string'
        ? { message: exceptionResponse }
        : (exceptionResponse as any);

    // Don't log 404s for /metrics when prometheus module isn't configured yet
    if (request.url === '/metrics' && status === 404) {
      response.status(status).json({ message: 'Metrics not configured' });
      return;
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: error.message || 'An error occurred',
      errors: error.errors || null,
    };

    this.logger.error(
      `${request.method} ${request.url} ${status}: ${JSON.stringify(error.message)}`,
    );

    response.status(status).json(errorResponse);
  }
}
