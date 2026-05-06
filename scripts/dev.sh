#!/bin/bash
# scripts/dev.sh

set -e

echo "🚀 Starting DocVault development environment..."

# Start infrastructure
docker-compose up -d \
  postgres \
  keycloak \
  minio \
  minio-init \
  rabbitmq \
  kafka \
  zookeeper \
  redis \
  mailhog

echo "⏳ Waiting for services to be healthy..."
sleep 15

# Check services
echo "✅ Checking service health..."
curl -sf http://localhost:9000/minio/health/live && echo "MinIO: OK"
curl -sf http://localhost:8080/health/live && echo "Keycloak: OK" || echo "Keycloak: Starting..."

echo "🔧 Running database migrations..."
cd apps/api && npm run db:migrate && cd ../..

echo "🌱 Seeding database..."
cd apps/api && npm run db:seed && cd ../..

echo ""
echo "✅ Infrastructure ready!"
echo "📊 Services:"
echo "  - API:        http://localhost:4000"
echo "  - Web:        http://localhost:3000"
echo "  - Keycloak:   http://localhost:8080"
echo "  - MinIO:      http://localhost:9001"
echo "  - RabbitMQ:   http://localhost:15672"
echo "  - MailHog:    http://localhost:8025"
echo ""
echo "Starting application..."

# Start both apps in parallel
cd apps/api && npm run start:dev &
cd apps/web && npm run dev &

wait