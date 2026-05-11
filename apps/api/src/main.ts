// src/main.ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('API_PORT', 4000);

  // Security
  app.use(
    helmet({
      contentSecurityPolicy: false, // disable for swagger UI
    }),
  );

  // CORS
  app.enableCors({
    origin: configService.get('WEB_URL', 'http://localhost:3000'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
  });

  // Global prefix — exclude /metrics so Prometheus can scrape it cleanly
  app.setGlobalPrefix('api/v1', {
    exclude: ['/metrics', '/health'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new TransformInterceptor(),
  );

  // Swagger — only in non-production
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('DocVault API')
      .setDescription('Multi-tenant document management platform')
      .setVersion('1.0')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
        'JWT-auth',
      )
      .addTag('auth')
      .addTag('organizations')
      .addTag('users')
      .addTag('documents')
      .addTag('notifications')
      .addTag('audit')
      .addTag('health')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    });

    logger.log(`📚 Swagger: http://localhost:${port}/api/docs`);
  }

  await app.listen(port);

  logger.log(`🚀 API:     http://localhost:${port}/api/v1`);
  logger.log(`📊 Metrics: http://localhost:${port}/metrics`);
  logger.log(`❤️  Health:  http://localhost:${port}/health`);
}

bootstrap();
