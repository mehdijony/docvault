# Run this script to identify which registry is blocked
# scripts/pull-images.sh

#!/bin/bash

IMAGES=(
  "postgres:15-alpine"
  "keycloak/keycloak:23.0.4"
  "minio/minio:latest"
  "minio/mc:latest"
  "rabbitmq:3.12-management-alpine"
  "bitnami/kafka:3.6"
  "redis:7.2-alpine"
  "hashicorp/vault:1.15"
  "prom/prometheus:latest"
  "grafana/grafana:latest"
  "grafana/loki:latest"
  "mailhog/mailhog:latest"
)

echo "Testing Docker image pulls..."
echo "================================"

for image in "${IMAGES[@]}"; do
  echo -n "Pulling $image ... "
  if docker pull "$image" --quiet 2>/dev/null; then
    echo "✅ OK"
  else
    echo "❌ FAILED"
  fi
done