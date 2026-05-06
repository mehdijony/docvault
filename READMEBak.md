# 1. Clone and setup
git clone https://github.com/yourname/docvault
cd docvault
npm install

# 2. Start infrastructure
npm run docker:up

# 3. Wait ~30s for Keycloak to start, then:
cd apps/api
npm install
npm run start:dev

# 4. In another terminal:
cd apps/web
npm install
npm run dev

# 5. Open browser
# Web: http://localhost:3000
# API Docs: http://localhost:4000/api/docs
# Keycloak: http://localhost:8080 (admin/admin)
# MinIO: http://localhost:9001 (minioadmin/minioadmin)
# RabbitMQ: http://localhost:15672 (admin/admin)
# MailHog: http://localhost:8025
# Prometheus: http://localhost:9090