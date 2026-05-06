// src/modules/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import {
  PrometheusModule,
  makeCounterProvider,
  makeHistogramProvider,
  makeGaugeProvider,
} from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register({
      path: '/metrics',        // ← will be at /api/v1/metrics after global prefix
      defaultMetrics: {
        enabled: true,
      },
    }),
  ],
  providers: [
    // Document counters
    makeCounterProvider({
      name: 'docvault_documents_uploaded_total',
      help: 'Total number of documents uploaded',
      labelNames: ['organization_id', 'mime_type'],
    }),
    makeCounterProvider({
      name: 'docvault_documents_downloaded_total',
      help: 'Total number of document downloads',
      labelNames: ['organization_id'],
    }),
    makeCounterProvider({
      name: 'docvault_documents_deleted_total',
      help: 'Total number of documents deleted',
      labelNames: ['organization_id'],
    }),
    // HTTP metrics
    makeHistogramProvider({
      name: 'docvault_http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
    }),
    makeCounterProvider({
      name: 'docvault_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
    }),
    // Queue metrics
    makeGaugeProvider({
      name: 'docvault_queue_depth',
      help: 'Current message queue depth',
      labelNames: ['queue_name'],
    }),
    // Storage metrics
    makeGaugeProvider({
      name: 'docvault_storage_used_bytes',
      help: 'Storage used per organization in bytes',
      labelNames: ['organization_id'],
    }),
  ],
  exports: [PrometheusModule],
})
export class MetricsModule {}