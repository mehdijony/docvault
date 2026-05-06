# DocVault — Complete README Files

## File 1: Root README.md

```markdown
# 🏛️ DocVault — Multi-Tenant Document Management Platform

A production-ready document management platform built with **NestJS**, **Next.js**,
and a full open-source infrastructure stack. Organizations can securely upload,
manage, share, and collaborate on documents with complete audit trails.

---

## 📋 Table of Contents

- [What is DocVault?](#what-is-docvault)
- [Architecture Overview](#architecture-overview)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Service URLs](#service-urls)
- [Project Structure](#project-structure)
- [How Everything Connects](#how-everything-connects)
- [Development Workflow](#development-workflow)
- [Troubleshooting](#troubleshooting)

---

## 🤔 What is DocVault?

DocVault is a **multi-tenant SaaS document management platform**. Think of it like
Google Drive for organizations — but self-hosted and open-source.

**What it does:**

- Organizations sign up and get their own isolated workspace
- Users within an organization can upload, download, and share documents
- Every action is tracked in an immutable audit trail
- Background workers automatically generate thumbnails and extract text
- Real-time notifications when documents are shared or updated
- Role-based access control — Owner, Admin, Editor, Viewer

**Why it's interesting as a portfolio project:**
Every piece of the infrastructure has a real reason to exist. Nothing is forced.

---

## 🏗️ Architecture Overview
```

                    ┌─────────────────────────────────────────┐
                    │            User's Browser                │
                    └──────────────┬──────────────────────────┘
                                   │ HTTP
                    ┌──────────────▼──────────────────────────┐
                    │         Next.js Frontend                 │
                    │         localhost:3000                    │
                    └──────────────┬──────────────────────────┘
                                   │ REST API calls
                    ┌──────────────▼──────────────────────────┐
                    │         NestJS API                       │
                    │         localhost:4000                    │
                    └──┬───────┬────────┬──────────┬──────────┘
                       │       │        │          │
            ┌──────────▼─┐ ┌───▼────┐ ┌─▼──────┐ ┌▼─────────┐
            │ PostgreSQL │ │ MinIO  │ │Rabbit  │ │  Kafka   │
            │ (database) │ │(files) │ │  MQ    │ │ (events) │
            └────────────┘ └────────┘ └────────┘ └──────────┘
                                           │
                                  ┌────────▼────────┐
                                  │Background Worker│
                                  │(thumbnails,     │
                                  │ notifications)  │
                                  └─────────────────┘

            ┌────────────┐ ┌────────┐ ┌────────────────────────┐
            │  Keycloak  │ │ Redis  │ │ Prometheus + Grafana   │
            │   (auth)   │ │(cache) │ │   (observability)      │
            └────────────┘ └────────┘ └────────────────────────┘

````

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose | Why This Tool |
|---|---|---|---|
| **Frontend** | Next.js 14 + TypeScript | User interface | React with SSR, great DX |
| **Backend** | NestJS + TypeScript | REST API | Structured, decorator-based Node.js |
| **Database** | PostgreSQL 15 | Store all data | Reliable relational DB with JSON support |
| **Auth** | Keycloak 23 | Login, SSO, roles | Industry standard OIDC provider |
| **File Storage** | MinIO | Store uploaded files | S3-compatible, self-hosted |
| **Message Queue** | RabbitMQ | Background job queue | Reliable async processing |
| **Event Stream** | Apache Kafka | Audit event stream | Immutable, replayable event log |
| **Cache** | Redis | Session and data cache | Fast in-memory store |
| **Secrets** | HashiCorp Vault | Secrets management | Secure credential storage |
| **Observability** | Prometheus + Grafana | Metrics and dashboards | Industry standard monitoring |
| **Log Aggregation** | Loki | Centralized logs | Pairs with Grafana |
| **Email Testing** | MailHog | Catch outgoing emails | Never send real emails in dev |

---

## ✅ Prerequisites

Before you begin, make sure you have these installed:

```bash
# Check versions
node --version      # Need v18 or higher
npm --version       # Need v9 or higher
docker --version    # Need v24 or higher
docker-compose --version  # Need v2.x
git --version
````

**Install guides:**

- Node.js: https://nodejs.org (use LTS version)
- Docker Desktop: https://www.docker.com/products/docker-desktop

**System Requirements:**

- RAM: 8GB minimum, 16GB recommended (many services run simultaneously)
- Disk: 10GB free space for Docker images and data
- OS: Windows 10/11 with WSL2, macOS, or Linux

---

## 🚀 Quick Start

Follow these steps in order. Do not skip steps.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/yourname/docvault.git
cd docvault
```

### Step 2 — Create Environment File

```bash
# Copy the example environment file
copy .env.example .env        # Windows
cp .env.example .env          # Mac/Linux

# The defaults work for local development
# You do NOT need to change anything to get started
```

### Step 3 — Install Dependencies

```bash
# Install root workspace dependencies
npm install

# Install API dependencies
cd apps/api && npm install && cd ../..

# Install web dependencies
cd apps/web && npm install && cd ../..
```

### Step 4 — Start Infrastructure Services

```bash
# This starts PostgreSQL, Keycloak, MinIO, RabbitMQ, Kafka, Redis, etc.
docker-compose up -d

# Check that all containers started
docker-compose ps
```

**Expected output** — all should show "Up":

```
NAME                      STATUS
docvault-postgres         Up (healthy)
docvault-keycloak         Up (healthy)    ← takes ~60-90 seconds
docvault-minio            Up (healthy)
docvault-rabbitmq         Up (healthy)
docvault-kafka            Up (healthy)
docvault-redis            Up (healthy)
docvault-vault            Up (healthy)
docvault-prometheus       Up
docvault-grafana          Up
docvault-mailhog          Up
```

### Step 5 — Wait for Keycloak

Keycloak is the slowest service to start (60-90 seconds).
Watch its logs until you see the success message:

```bash
docker logs docvault-keycloak -f

# Wait until you see this line:
# "Running the server in development mode"
# Then press Ctrl+C to stop watching logs
```

### Step 6 — Start the API

```bash
# Open a new terminal
cd apps/api
npm run start:dev

# Wait for this message:
# 🚀 DocVault API running on http://localhost:4000/api/v1
```

### Step 7 — Start the Frontend

```bash
# Open another new terminal
cd apps/web
npm run dev

# Wait for this message:
# ✓ Ready in Xms
# ▲ Next.js
```

### Step 8 — Open the Application

| Service              | URL                            | Credentials             |
| -------------------- | ------------------------------ | ----------------------- |
| **Web App**          | http://localhost:3000          | Register a new account  |
| **API Docs**         | http://localhost:4000/api/docs | No login needed         |
| **Keycloak Admin**   | http://localhost:8080/admin    | admin / admin           |
| **MinIO Console**    | http://localhost:9001          | minioadmin / minioadmin |
| **RabbitMQ Console** | http://localhost:15672         | admin / admin           |
| **Grafana**          | http://localhost:3001          | admin / admin           |
| **MailHog**          | http://localhost:8025          | No login needed         |
| **Prometheus**       | http://localhost:9090          | No login needed         |

---

## 📁 Project Structure

```
docvault/
│
├── 📄 docker-compose.yml          ← Defines all infrastructure services
├── 📄 .env.example                ← Copy this to .env
├── 📄 package.json                ← Monorepo root
├── 📄 turbo.json                  ← Turborepo build pipeline config
│
├── 🗂️ apps/
│   ├── 🗂️ api/                    ← NestJS backend application
│   │   └── src/
│   │       ├── main.ts            ← App entry point
│   │       ├── app.module.ts      ← Root module, wires everything together
│   │       ├── common/            ← Shared utilities used across modules
│   │       │   ├── decorators/    ← @CurrentUser(), @Roles(), @Public()
│   │       │   ├── guards/        ← JWT auth guard, roles guard
│   │       │   ├── filters/       ← Error response formatting
│   │       │   ├── interceptors/  ← Request logging, response wrapping
│   │       │   └── middleware/    ← Tenant ID extraction
│   │       ├── config/            ← Service connection configurations
│   │       └── modules/           ← Feature modules (one per domain)
│   │           ├── auth/          ← Login, logout, token refresh
│   │           ├── organizations/ ← Organization CRUD
│   │           ├── users/         ← User management
│   │           ├── documents/     ← Core document operations
│   │           ├── storage/       ← MinIO file operations
│   │           ├── messaging/     ← RabbitMQ + Kafka clients
│   │           ├── notifications/ ← User notifications
│   │           ├── audit/         ← Audit log
│   │           ├── health/        ← Health check endpoint
│   │           └── metrics/       ← Prometheus metrics
│   │
│   └── 🗂️ web/                   ← Next.js frontend application
│       └── src/
│           ├── app/               ← Next.js App Router pages
│           ├── components/        ← React components
│           ├── lib/               ← API client, utilities
│           ├── hooks/             ← React Query hooks
│           └── providers/         ← Context providers
│
└── 🗂️ infrastructure/
    ├── keycloak/                  ← Keycloak realm configuration
    ├── prometheus/                ← Metrics scrape config
    ├── grafana/                   ← Dashboard definitions
    ├── postgres/                  ← Database init scripts
    └── loki/                      ← Log aggregation config
```

---

## 🔗 How Everything Connects

### When a User Logs In:

```
1. User clicks "Login" in Next.js frontend
2. Next.js redirects to Keycloak login page (port 8080)
3. User enters credentials in Keycloak
4. Keycloak redirects back with an authorization code
5. Next.js exchanges the code for JWT tokens
6. JWT token is stored in the session
7. Every API request includes "Authorization: Bearer <token>"
8. NestJS validates the token against Keycloak's public keys
9. User's identity is available in every endpoint via @CurrentUser()
```

### When a User Uploads a Document:

```
1. User drags a file onto the upload area in Next.js
2. Next.js sends POST /api/v1/documents/upload with the file
3. NestJS receives the file in memory (multer)
4. NestJS uploads the file to MinIO (stored as S3-compatible object)
5. NestJS creates a database record in PostgreSQL (status: "processing")
6. NestJS publishes a message to RabbitMQ ("document.uploaded")
7. NestJS publishes an event to Kafka ("document-events" topic)
8. NestJS returns the document record to the frontend immediately
   --- Background processing happens asynchronously ---
9. RabbitMQ worker picks up the message
10. Worker downloads the file from MinIO
11. Worker generates a thumbnail (for images)
12. Worker uploads thumbnail back to MinIO
13. Worker updates PostgreSQL record (status: "ready")
14. Kafka consumer writes audit log entry to PostgreSQL
```

### When a User Downloads a Document:

```
1. User clicks "Download" button
2. Next.js calls GET /api/v1/documents/:id/download
3. NestJS verifies the user has access to this document
4. NestJS asks MinIO to generate a "presigned URL"
   (a time-limited URL that grants direct download access)
5. NestJS returns the presigned URL to the frontend
6. Next.js opens the presigned URL in a new tab
7. User's browser downloads the file directly from MinIO
   (NestJS is NOT in the download path — efficient!)
8. Audit event is logged to Kafka and PostgreSQL
```

---

## 🔄 Development Workflow

### Making Changes to the API

```bash
# The API hot-reloads automatically when you save files
cd apps/api
npm run start:dev

# Run tests
npm run test

# Run tests with coverage
npm run test:cov

# Check for TypeScript errors without running
npx tsc --noEmit
```

### Making Changes to the Frontend

```bash
# Next.js hot-reloads automatically
cd apps/web
npm run dev

# Build for production
npm run build
```

### Resetting the Database

```bash
# Stop everything
docker-compose down

# Remove database volume (destroys all data)
docker volume rm docvault_postgres_data

# Start fresh
docker-compose up -d
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker logs docvault-keycloak -f
docker logs docvault-postgres -f
docker logs docvault-kafka -f

# API logs (shown in your terminal where npm run start:dev is running)
```

---

## 🐛 Troubleshooting

### "Keycloak won't start"

```bash
# Check the logs for the specific error
docker logs docvault-keycloak --tail=50

# Most common cause: realm-export.json has invalid fields
# Make sure the file has no JavaScript comments (//)
node -e "JSON.parse(require('fs').readFileSync('infrastructure/keycloak/realm-export.json','utf8')); console.log('Valid!')"
```

### "Cannot connect to database"

```bash
# Check PostgreSQL is healthy
docker-compose ps postgres

# Check you can connect
docker exec -it docvault-postgres psql -U postgres -c "\l"
```

### "MinIO bucket not found"

```bash
# Re-run the bucket initialization
docker-compose up minio-init
```

### "Kafka connection refused"

```bash
# Kafka takes ~30 seconds to be ready after starting
# Check its health
docker logs docvault-kafka --tail=20

# Test if Kafka is accepting connections
docker exec -it docvault-kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:9092 --list
```

### "Port already in use"

```bash
# Find what's using the port (example: port 5432)
netstat -ano | findstr :5432    # Windows
lsof -i :5432                   # Mac/Linux

# Kill the process or stop the conflicting service
```

### Nuclear option — full reset

```bash
# Stop everything and remove all data
docker-compose down -v

# Pull fresh images
docker-compose pull

# Start fresh
docker-compose up -d
```

````

---

## File 2: apps/api/README.md

```markdown
# 🔧 DocVault API — NestJS Backend

The DocVault backend API built with NestJS and TypeScript.
Handles authentication, document management, file storage,
background job coordination, and audit logging.

---

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [API Endpoints Reference](#api-endpoints-reference)
- [Authentication Explained](#authentication-explained)
- [Module Guide](#module-guide)
- [Database Schema](#database-schema)
- [Message Flow](#message-flow)
- [Environment Variables](#environment-variables)
- [Testing the API](#testing-the-api)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have completed the root README setup first.
All infrastructure services must be running via `docker-compose up -d`.

### Start the API

```bash
cd apps/api
npm install
npm run start:dev
````

### Verify It's Running

```bash
# Health check
curl http://localhost:4000/health

# Expected response:
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  }
}
```

### Interactive API Documentation

Open your browser: **http://localhost:4000/api/docs**

This is a Swagger UI where you can:

- See every available endpoint
- Read what each endpoint does
- Test endpoints directly in the browser
- See request/response schemas

---

## 🏗️ Architecture

### How NestJS is Organized

NestJS uses a **modular architecture**. Think of each module as a self-contained
feature. Each module has:

```
module-name/
├── module-name.module.ts     ← Wires everything together (like a barrel file)
├── module-name.controller.ts ← Handles HTTP requests (routes)
├── module-name.service.ts    ← Business logic
├── entities/                 ← Database table definitions
└── dto/                      ← Data Transfer Objects (request/response shapes)
```

### Request Lifecycle

Every HTTP request goes through this pipeline before reaching your code:

```
HTTP Request
    │
    ▼
TenantMiddleware          ← Extracts X-Tenant-ID header
    │
    ▼
JwtAuthGuard              ← Validates JWT token from Keycloak
    │
    ▼
RolesGuard                ← Checks user has required role
    │
    ▼
ValidationPipe            ← Validates request body against DTO schema
    │
    ▼
LoggingInterceptor        ← Logs the request
    │
    ▼
Controller Method         ← Your actual code runs here
    │
    ▼
TransformInterceptor      ← Wraps response in { success, data, timestamp }
    │
    ▼
HTTP Response
```

If anything goes wrong at any step, `HttpExceptionFilter` catches it
and returns a consistent error format.

---

## 📡 API Endpoints Reference

### Base URL

```
http://localhost:4000/api/v1
```

### Standard Response Format

Every successful response is wrapped like this:

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-05-06T10:00:00.000Z",
  "path": "/api/v1/documents"
}
```

Every error response looks like this:

```json
{
  "success": false,
  "statusCode": 404,
  "timestamp": "2026-05-06T10:00:00.000Z",
  "path": "/api/v1/documents/abc",
  "method": "GET",
  "message": "Document abc not found",
  "errors": null
}
```

---

### 🔐 Auth Endpoints

These endpoints handle authentication via Keycloak.

---

#### `GET /auth/login`

**What it does:** Returns the Keycloak login URL.
Redirect the user to this URL to start the OAuth2 login flow.

**Who can call it:** Anyone (no authentication required)

**Query Parameters:**
| Parameter | Type | Required | Description |
|---|---|---|---|
| `redirectUri` | string | Yes | Where Keycloak sends the user after login |

**Example Request:**

```bash
curl "http://localhost:4000/api/v1/auth/login?redirectUri=http://localhost:3000/callback"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "url": "http://localhost:8080/realms/docvault/protocol/openid-connect/auth?client_id=docvault-api&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&response_type=code&scope=openid+email+profile"
  }
}
```

**How the login flow works:**

```
1. Your frontend calls GET /auth/login?redirectUri=http://localhost:3000/callback
2. You get back a Keycloak URL
3. You redirect the user's browser to that URL
4. User enters credentials on the Keycloak page
5. Keycloak redirects to your redirectUri with ?code=AUTHORIZATION_CODE
6. Your frontend calls POST /auth/callback with that code
7. You get back access_token and refresh_token
8. Store the tokens and use access_token in all future requests
```

---

#### `POST /auth/callback`

**What it does:** Exchanges an authorization code for JWT tokens.
Called after Keycloak redirects back to your app.

**Who can call it:** Anyone (no authentication required)

**Request Body:**

```json
{
  "code": "the-authorization-code-from-keycloak",
  "redirectUri": "http://localhost:3000/callback"
}
```

**Example Request:**

```bash
curl -X POST http://localhost:4000/api/v1/auth/callback \
  -H "Content-Type: application/json" \
  -d '{
    "code": "abc123...",
    "redirectUri": "http://localhost:3000/callback"
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiJ9...",
    "refresh_token": "eyJhbGciOiJIUzUxMiJ9...",
    "expires_in": 300,
    "refresh_expires_in": 1800,
    "token_type": "Bearer"
  }
}
```

**Important:** The `access_token` expires in 5 minutes (300 seconds).
Use the `refresh_token` to get a new one before it expires.

---

#### `POST /auth/refresh`

**What it does:** Gets a new access token using a refresh token.
Call this before the access token expires (every ~4 minutes).

**Who can call it:** Anyone (no authentication required)

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Example Request:**

```bash
curl -X POST http://localhost:4000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "your-refresh-token" }'
```

**Example Response:** Same as `/auth/callback` — new tokens.

---

#### `POST /auth/logout`

**What it does:** Invalidates the user's session in Keycloak.
The refresh token will no longer work after this.

**Who can call it:** Authenticated users

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzUxMiJ9..."
}
```

**Example Request:**

```bash
curl -X POST http://localhost:4000/api/v1/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "refreshToken": "your-refresh-token" }'
```

**Example Response:**

```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

#### `GET /auth/me`

**What it does:** Returns the currently logged-in user's information
extracted from their JWT token.

**Who can call it:** Authenticated users

**Request Headers:**

```
Authorization: Bearer <access_token>
```

**Example Request:**

```bash
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "keycloakId": "a1b2c3d4-...",
    "email": "admin@docvault.dev",
    "firstName": "Admin",
    "lastName": "User",
    "role": "owner",
    "organizationId": "org-uuid-here"
  }
}
```

---

### 🏢 Organization Endpoints

Manage your organization's settings and information.

---

#### `GET /organizations/me`

**What it does:** Returns the current user's organization details,
including storage usage and plan information.

**Who can call it:** Any authenticated user

**Example Request:**

```bash
curl http://localhost:4000/api/v1/organizations/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "org-uuid",
    "name": "Acme Corporation",
    "slug": "acme-corporation",
    "plan": "pro",
    "status": "active",
    "storageQuotaBytes": 5368709120,
    "storageUsedBytes": 2147483648,
    "storageBucket": "org-acme-corporation",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

**Understanding storage fields:**

- `storageQuotaBytes`: Maximum allowed storage (5GB = 5,368,709,120 bytes)
- `storageUsedBytes`: How much is currently used
- Calculate percentage: `(used / quota) * 100`

---

#### `PATCH /organizations/me`

**What it does:** Updates organization name or description.

**Who can call it:** Admin and Owner roles only

**Request Body** (all fields optional):

```json
{
  "name": "New Organization Name",
  "description": "Updated description"
}
```

**Example Request:**

```bash
curl -X PATCH http://localhost:4000/api/v1/organizations/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "New Name" }'
```

---

### 👤 User Endpoints

Manage users within your organization.

---

#### `GET /users`

**What it does:** Returns a list of all users in your organization.

**Who can call it:** Admin and Owner roles only

**Example Request:**

```bash
curl http://localhost:4000/api/v1/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid-1",
      "email": "admin@docvault.dev",
      "firstName": "Admin",
      "lastName": "User",
      "role": "owner",
      "status": "active",
      "lastLoginAt": "2026-05-06T10:00:00.000Z",
      "createdAt": "2026-01-01T00:00:00.000Z"
    },
    {
      "id": "user-uuid-2",
      "email": "john@acme.com",
      "firstName": "John",
      "lastName": "Smith",
      "role": "editor",
      "status": "active",
      "lastLoginAt": "2026-05-05T09:00:00.000Z",
      "createdAt": "2026-02-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `GET /users/me`

**What it does:** Returns the current user's full profile from the database.
More detailed than `/auth/me` which only reads from the JWT token.

**Who can call it:** Any authenticated user

**Example Request:**

```bash
curl http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

#### `GET /users/:id`

**What it does:** Returns a specific user's profile by their UUID.

**Who can call it:** Admin and Owner roles only

**URL Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | The user's unique identifier |

**Example Request:**

```bash
curl http://localhost:4000/api/v1/users/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

#### `PATCH /users/:id/role`

**What it does:** Changes a user's role within the organization.

**Who can call it:** Admin and Owner roles only

**Available Roles:**

| Role     | Can Do                      |
| -------- | --------------------------- |
| `owner`  | Everything — full control   |
| `admin`  | Manage users, all documents |
| `editor` | Upload, edit own documents  |
| `viewer` | View and download only      |

**Request Body:**

```json
{
  "role": "editor"
}
```

**Example Request:**

```bash
curl -X PATCH \
  http://localhost:4000/api/v1/users/user-uuid/role \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "role": "editor" }'
```

---

### 📄 Document Endpoints

The core of the application — upload, manage, share documents.

---

#### `POST /documents/upload`

**What it does:** Uploads a new document to the platform.

**Who can call it:** Editor, Admin, Owner roles

**How it works behind the scenes:**

1. File is received in memory by NestJS (using multer)
2. File is uploaded to MinIO (S3-compatible storage)
3. A database record is created with status `processing`
4. A message is published to RabbitMQ for background processing
5. An audit event is published to Kafka
6. The document record is immediately returned (don't wait for processing)
7. Background worker picks up the message and generates thumbnails
8. Document status changes to `ready` when processing completes

**Request:** `multipart/form-data`

| Field         | Type     | Required | Description                      |
| ------------- | -------- | -------- | -------------------------------- |
| `file`        | File     | Yes      | The document file to upload      |
| `name`        | string   | Yes      | Display name for the document    |
| `description` | string   | No       | Optional description             |
| `folderId`    | UUID     | No       | Place document in this folder    |
| `tags`        | string[] | No       | Tags for organization and search |

**Supported file types:**

- PDF (`.pdf`)
- Word (`.doc`, `.docx`)
- Excel (`.xls`, `.xlsx`)
- Images (`.jpg`, `.jpeg`, `.png`, `.webp`)
- Text (`.txt`)

**Maximum file size:** 100MB

**Example Request:**

```bash
curl -X POST http://localhost:4000/api/v1/documents/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "name=Q1 Financial Report" \
  -F "description=Financial results for Q1 2026" \
  -F "tags=finance,quarterly,2026"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "name": "Q1 Financial Report",
    "description": "Financial results for Q1 2026",
    "originalFilename": "document.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 2048576,
    "status": "processing",
    "tags": ["finance", "quarterly", "2026"],
    "currentVersion": 1,
    "organizationId": "org-uuid",
    "uploadedById": "user-uuid",
    "createdAt": "2026-05-06T10:00:00.000Z",
    "updatedAt": "2026-05-06T10:00:00.000Z"
  }
}
```

**Note:** `status` will be `"processing"` immediately after upload.
Poll `GET /documents/:id` until status becomes `"ready"`.

---

#### `GET /documents`

**What it does:** Returns a paginated list of documents in your organization.
Supports search, filtering by folder, and filtering by tags.

**Who can call it:** Any authenticated user (sees only their organization's docs)

**Query Parameters:**

| Parameter  | Type     | Default | Description                                     |
| ---------- | -------- | ------- | ----------------------------------------------- |
| `query`    | string   | -       | Search in name, description, and extracted text |
| `folderId` | UUID     | -       | Filter to documents in a specific folder        |
| `tags`     | string[] | -       | Filter by tags                                  |
| `page`     | number   | 1       | Page number for pagination                      |
| `limit`    | number   | 20      | Results per page (max 100)                      |

**Example Requests:**

```bash
# Get first page of all documents
curl "http://localhost:4000/api/v1/documents" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Search for "financial report"
curl "http://localhost:4000/api/v1/documents?query=financial+report" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Get page 2 with 50 results per page
curl "http://localhost:4000/api/v1/documents?page=2&limit=50" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Filter by tags
curl "http://localhost:4000/api/v1/documents?tags=finance&tags=2026" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "doc-uuid-1",
        "name": "Q1 Financial Report",
        "mimeType": "application/pdf",
        "sizeBytes": 2048576,
        "status": "ready",
        "tags": ["finance", "quarterly"],
        "currentVersion": 1,
        "uploadedBy": {
          "id": "user-uuid",
          "firstName": "Admin",
          "lastName": "User",
          "email": "admin@docvault.dev"
        },
        "createdAt": "2026-05-06T10:00:00.000Z"
      }
    ],
    "total": 47,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

#### `GET /documents/:id`

**What it does:** Returns full details of a specific document,
including all versions and folder information.

**Who can call it:** Any authenticated user in the same organization

**URL Parameters:**
| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | The document's unique identifier |

**Example Request:**

```bash
curl http://localhost:4000/api/v1/documents/doc-uuid \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "doc-uuid",
    "name": "Q1 Financial Report",
    "description": "Financial results for Q1 2026",
    "originalFilename": "q1-report.pdf",
    "mimeType": "application/pdf",
    "sizeBytes": 2048576,
    "status": "ready",
    "storagePath": "org-abc/documents/doc-uuid/v1/q1-report.pdf",
    "thumbnailPath": "org-abc/thumbnails/doc-uuid/thumb.webp",
    "tags": ["finance", "quarterly", "2026"],
    "currentVersion": 2,
    "uploadedBy": {
      "id": "user-uuid",
      "firstName": "Admin",
      "lastName": "User"
    },
    "folder": {
      "id": "folder-uuid",
      "name": "Finance"
    },
    "versions": [
      {
        "id": "version-uuid-1",
        "versionNumber": 1,
        "sizeBytes": 1024000,
        "createdAt": "2026-05-01T10:00:00.000Z"
      },
      {
        "id": "version-uuid-2",
        "versionNumber": 2,
        "sizeBytes": 2048576,
        "changeNote": "Updated with corrected figures",
        "createdAt": "2026-05-06T10:00:00.000Z"
      }
    ],
    "createdAt": "2026-05-01T10:00:00.000Z",
    "updatedAt": "2026-05-06T10:00:00.000Z"
  }
}
```

---

#### `GET /documents/:id/download`

**What it does:** Returns a **presigned URL** for downloading the document.

**Who can call it:** Any authenticated user in the same organization

**What is a presigned URL?**
Instead of streaming the file through the API (slow, uses server bandwidth),
MinIO generates a special time-limited URL that lets the user download
the file directly from MinIO. The URL is only valid for 1 hour.

**Example Request:**

```bash
curl http://localhost:4000/api/v1/documents/doc-uuid/download \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "url": "http://localhost:9000/documents/org-abc/documents/doc-uuid/v1/report.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Expires=3600&X-Amz-Signature=...",
    "expiresIn": 3600
  }
}
```

**How to use it in your frontend:**

```javascript
const { data } = await fetch("/api/v1/documents/doc-uuid/download");
window.open(data.url, "_blank"); // Opens direct download
```

---

#### `PATCH /documents/:id`

**What it does:** Updates document metadata (name, description, folder, tags).
Does NOT upload a new file version — use the upload endpoint for that.

**Who can call it:**

- Editor: can update their own documents only
- Admin/Owner: can update any document

**Request Body** (all fields optional):

```json
{
  "name": "Updated Document Name",
  "description": "New description",
  "folderId": "folder-uuid",
  "tags": ["new", "tags"]
}
```

**Example Request:**

```bash
curl -X PATCH http://localhost:4000/api/v1/documents/doc-uuid \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q1 Financial Report (Final)",
    "tags": ["finance", "quarterly", "2026", "final"]
  }'
```

---

#### `POST /documents/:id/share`

**What it does:** Creates a shareable link for a document.
The link can be set to expire and can be public (no login required)
or restricted to specific users.

**Who can call it:** Editor, Admin, Owner roles

**Request Body:**

```json
{
  "permission": "download",
  "expiresAt": "2026-06-01T00:00:00.000Z",
  "isPublic": true,
  "maxAccessCount": 10
}
```

**Permission levels:**
| Permission | What the recipient can do |
|---|---|
| `view` | Open and view the document only |
| `download` | View and download the document |
| `edit` | View, download, and edit metadata |

**Field descriptions:**
| Field | Required | Description |
|---|---|---|
| `permission` | Yes | What the recipient can do |
| `expiresAt` | No | ISO date when link expires (null = never) |
| `isPublic` | No | If true, anyone with the link can access |
| `maxAccessCount` | No | Maximum times the link can be accessed |

**Example Request:**

```bash
curl -X POST http://localhost:4000/api/v1/documents/doc-uuid/share \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "permission": "view",
    "expiresAt": "2026-06-01T00:00:00.000Z",
    "isPublic": true
  }'
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "id": "share-uuid",
    "token": "abc123def456",
    "permission": "view",
    "isPublic": true,
    "expiresAt": "2026-06-01T00:00:00.000Z",
    "accessCount": 0,
    "createdAt": "2026-05-06T10:00:00.000Z"
  }
}
```

The share URL would be: `http://localhost:3000/shared/abc123def456`

---

#### `DELETE /documents/:id`

**What it does:** Soft-deletes a document.
The document is marked as deleted but NOT immediately removed from storage.
A cleanup job runs in the background to remove the actual files.

**Who can call it:**

- Editor: can delete their own documents only
- Admin/Owner: can delete any document

**Example Request:**

```bash
curl -X DELETE http://localhost:4000/api/v1/documents/doc-uuid \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:** HTTP 204 No Content (empty body on success)

---

### 🔔 Notification Endpoints

User notification management.

---

#### `GET /notifications`

**What it does:** Returns the current user's notifications.

**Who can call it:** Any authenticated user

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 20 | Results per page |

**Example Request:**

```bash
curl "http://localhost:4000/api/v1/notifications?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "notif-uuid",
        "type": "document.shared",
        "title": "Document Shared With You",
        "message": "Admin User shared 'Q1 Report' with you",
        "isRead": false,
        "resourceId": "doc-uuid",
        "resourceType": "document",
        "createdAt": "2026-05-06T10:00:00.000Z"
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 10
  }
}
```

---

#### `GET /notifications/unread-count`

**What it does:** Returns just the count of unread notifications.
Use this to show a badge count in the UI.

**Example Request:**

```bash
curl http://localhost:4000/api/v1/notifications/unread-count \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": { "count": 3 }
}
```

---

#### `PATCH /notifications/:id/read`

**What it does:** Marks a single notification as read.

**Example Request:**

```bash
curl -X PATCH \
  http://localhost:4000/api/v1/notifications/notif-uuid/read \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

#### `PATCH /notifications/read-all`

**What it does:** Marks ALL notifications as read.

**Example Request:**

```bash
curl -X PATCH http://localhost:4000/api/v1/notifications/read-all \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 📋 Audit Log Endpoints

View the complete audit trail of actions in your organization.

---

#### `GET /audit`

**What it does:** Returns audit log entries for your organization.
Every action that happens in the system is recorded here.
Entries come from two sources:

1. Direct writes from the API (immediate)
2. Kafka consumer (streams from the event log)

**Who can call it:** Admin and Owner roles only

**Query Parameters:**
| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | number | 1 | Page number |
| `limit` | number | 50 | Results per page |

**Example Request:**

```bash
curl "http://localhost:4000/api/v1/audit?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Example Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "audit-uuid",
        "action": "document.upload",
        "userId": "user-uuid",
        "resourceId": "doc-uuid",
        "resourceType": "document",
        "metadata": {
          "fileName": "q1-report.pdf",
          "fileSize": 2048576
        },
        "ipAddress": "192.168.1.100",
        "createdAt": "2026-05-06T10:00:00.000Z"
      },
      {
        "id": "audit-uuid-2",
        "action": "document.download",
        "userId": "user-uuid-2",
        "resourceId": "doc-uuid",
        "resourceType": "document",
        "metadata": {},
        "createdAt": "2026-05-06T11:00:00.000Z"
      }
    ],
    "total": 234,
    "page": 1,
    "limit": 20
  }
}
```

**All possible action types:**
| Action | Triggered When |
|---|---|
| `document.upload` | A document is uploaded |
| `document.download` | A download URL is requested |
| `document.view` | A document is viewed |
| `document.delete` | A document is deleted |
| `document.share` | A share link is created |
| `document.update` | Document metadata is updated |
| `user.login` | A user logs in |
| `user.logout` | A user logs out |
| `user.invite` | A user is invited |
| `user.role_change` | A user's role is changed |
| `org.created` | Organization is created |
| `org.settings_update` | Organization settings updated |

---

### ❤️ Health & Metrics Endpoints

---

#### `GET /health`

**What it does:** Returns the health status of all API dependencies.
Used by Docker, load balancers, and monitoring tools.

**Who can call it:** Anyone (no authentication)

**Example Request:**

```bash
curl http://localhost:4000/health
```

**Example Response:**

```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "memory_heap": {
      "status": "up",
      "heapUsed": 45678901,
      "threshold": 536870912
    },
    "memory_rss": {
      "status": "up",
      "rssUsed": 87654321,
      "threshold": 536870912
    }
  },
  "error": {},
  "details": {
    "database": { "status": "up" },
    "memory_heap": { "status": "up" },
    "memory_rss": { "status": "up" }
  }
}
```

If any dependency is down, the HTTP status code will be **503 Service Unavailable**.

---

#### `GET /metrics`

**What it does:** Returns metrics in Prometheus format.
Prometheus scrapes this endpoint every 15 seconds to collect metrics.

**Who can call it:** Anyone (used by Prometheus)

**Example Request:**

```bash
curl http://localhost:4000/metrics
```

**Example Response (Prometheus text format):**

```
# HELP process_cpu_user_seconds_total Total user CPU time spent in seconds.
# TYPE process_cpu_user_seconds_total counter
process_cpu_user_seconds_total 0.234

# HELP docvault_http_requests_total Total number of HTTP requests
# TYPE docvault_http_requests_total counter
docvault_http_requests_total{method="GET",route="/api/v1/documents",status_code="200"} 47

# HELP docvault_documents_uploaded_total Total number of documents uploaded
# TYPE docvault_documents_uploaded_total counter
docvault_documents_uploaded_total{organization_id="org-uuid"} 12
```

---

## 🔐 Authentication Explained

### How JWT Authentication Works

```
Your Request                    NestJS API              Keycloak
     │                              │                      │
     │  Authorization: Bearer JWT   │                      │
     ├─────────────────────────────>│                      │
     │                              │  Fetch public keys   │
     │                              │ (cached after first) │
     │                              ├─────────────────────>│
     │                              │<─────────────────────┤
     │                              │  Verify JWT signature│
     │                              │  Extract user claims │
     │                              │                      │
     │<─────────────────────────────┤                      │
     │  Response (or 401 if invalid)│                      │
```

### How to Authenticate Requests

All protected endpoints require this header:

```
Authorization: Bearer eyJhbGciOiJSUzI1NiJ9...
```

**Getting a token for testing:**

```bash
# Direct login (for testing only — normally use the OAuth flow)
curl -s -X POST \
  http://localhost:8080/realms/docvault/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=docvault-api" \
  -d "client_secret=docvault-api-secret" \
  -d "username=admin@docvault.dev" \
  -d "password=admin123"
```

Copy the `access_token` from the response and use it in your requests.

### Role Hierarchy

```
OWNER (level 4)
  └── Can do everything
ADMIN (level 3)
  └── Can manage users + all documents
EDITOR (level 2)
  └── Can upload + edit own documents
VIEWER (level 1)
  └── Can view + download only
```

Higher levels inherit all permissions of lower levels.
An ADMIN can do everything an EDITOR can, plus more.

---

## 🗄️ Database Schema

### Tables and Relationships

```
organizations
    │
    ├── users (many users belong to one organization)
    │       │
    │       └── documents (many documents uploaded by one user)
    │               │
    │               ├── document_versions (history of file versions)
    │               ├── document_shares (shareable links)
    │               └── folders (organizational hierarchy)
    │
    ├── notifications (per user, per organization)
    └── audit_logs (every action, per organization)
```

### Key Design Decisions

**Why soft delete?**
Documents are marked `status: "deleted"` instead of immediately removed.
This gives a grace period for recovery and allows the cleanup worker
to remove files from MinIO asynchronously.

**Why store `sizeBytes` as bigint?**
Files can exceed 2GB, which overflows a 32-bit integer.
BigInt handles files up to 9 exabytes.

**Why `organizationId` on every table?**
This is the multi-tenancy mechanism. Every query filters by `organizationId`,
ensuring users can never see data from other organizations.

---

## 📨 Message Flow

### RabbitMQ — What Goes Through It

RabbitMQ is used for **background jobs** — work that doesn't need to complete
before returning a response to the user.

```
Exchange: "documents" (topic type)
│
├── Routing key "document.uploaded"
│   └── Queue: "document.processing"
│       └── Worker: generates thumbnails, extracts text
│
├── Routing key "document.shared"
│   └── Queue: "document.notifications"
│       └── Worker: sends email notification
│
└── Routing key "document.deleted"
    └── Queue: "document.cleanup"
        └── Worker: removes files from MinIO

If a worker fails 3 times:
└── Dead letter queue: "document.dead_letter"
    └── Manual inspection required
```

### Kafka — What Goes Through It

Kafka is used for the **audit event stream** — an immutable log of everything
that happens. Unlike RabbitMQ queues (consumed and gone), Kafka topics retain
messages for 7 days and can be replayed.

```
Topics:
├── "document-events"
│   ├── document.upload
│   ├── document.download
│   ├── document.delete
│   └── document.share
│
├── "user-events"
│   ├── user.login
│   └── user.role_change
│
└── "org-events"
    └── org.settings_update

Consumers:
└── AuditConsumer (groupId: "audit-consumer-group")
    └── Reads all topics → writes to audit_logs table
```

---

## ⚙️ Environment Variables

All variables have sensible defaults for local development.
Copy `.env.example` to `.env` — no changes needed to get started.

| Variable                 | Default                             | Description                       |
| ------------------------ | ----------------------------------- | --------------------------------- |
| `NODE_ENV`               | `development`                       | Environment mode                  |
| `API_PORT`               | `4000`                              | Port the API listens on           |
| `DATABASE_URL`           | `postgresql://...`                  | Full PostgreSQL connection string |
| `KEYCLOAK_URL`           | `http://localhost:8080`             | Keycloak server URL               |
| `KEYCLOAK_REALM`         | `docvault`                          | Keycloak realm name               |
| `KEYCLOAK_CLIENT_ID`     | `docvault-api`                      | API client ID in Keycloak         |
| `KEYCLOAK_CLIENT_SECRET` | `docvault-api-secret`               | API client secret                 |
| `MINIO_ENDPOINT`         | `localhost`                         | MinIO server host                 |
| `MINIO_PORT`             | `9000`                              | MinIO server port                 |
| `MINIO_ROOT_USER`        | `minioadmin`                        | MinIO access key                  |
| `MINIO_ROOT_PASSWORD`    | `minioadmin`                        | MinIO secret key                  |
| `RABBITMQ_URL`           | `amqp://admin:admin@localhost:5672` | RabbitMQ connection               |
| `KAFKA_BROKERS`          | `localhost:9092`                    | Kafka broker addresses            |
| `REDIS_HOST`             | `localhost`                         | Redis server host                 |
| `REDIS_PASSWORD`         | `redis`                             | Redis password                    |
| `VAULT_ADDR`             | `http://localhost:8200`             | HashiCorp Vault URL               |
| `VAULT_TOKEN`            | `root`                              | Vault root token (dev only)       |

---

## 🧪 Testing the API

### Option 1 — Swagger UI (Easiest)

1. Open http://localhost:4000/api/docs
2. Click "Authorize" button (top right)
3. Enter your Bearer token
4. Click any endpoint to expand it
5. Click "Try it out" then "Execute"

### Option 2 — curl Commands

```bash
# Set your token as a variable to reuse it
TOKEN=$(curl -s -X POST \
  http://localhost:8080/realms/docvault/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=password&client_id=docvault-api&client_secret=docvault-api-secret&username=admin@docvault.dev&password=admin123" \
  | python -m json.tool | grep access_token | cut -d'"' -f4)

echo "Token: $TOKEN"

# Now use it in requests
curl http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:4000/api/v1/documents \
  -H "Authorization: Bearer $TOKEN"
```

### Option 3 — Import into Postman/Insomnia

The Swagger spec is available at:

```
http://localhost:4000/api/docs-json
```

Import this URL into Postman or Insomnia to get all endpoints pre-configured.

### Test Accounts

| Email                | Password   | Role          |
| -------------------- | ---------- | ------------- |
| `admin@docvault.dev` | `admin123` | Owner + Admin |
| `user@docvault.dev`  | `user123`  | Viewer        |

```

```
