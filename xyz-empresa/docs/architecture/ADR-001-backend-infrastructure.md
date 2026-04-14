# ADR-001: Backend Infrastructure for XYZ Empresa Aviation Product Suite

| Field        | Value                                  |
|--------------|----------------------------------------|
| **Status**   | Accepted                               |
| **Date**     | 2026-04-14                             |
| **Author**   | Tech Lead                              |
| **Scope**    | Platform-wide backend architecture     |

---

## 1. Context

XYZ Empresa is building an aviation SaaS platform comprising three customer-facing products and one internal tool. Today, the only implemented artifact is a client-side pilot expense tracker (`xyz-empresa/`) built with vanilla HTML/CSS/JS and localStorage. There is no backend, no database, no authentication, and no API layer.

This ADR defines the backend architecture that will support all four applications as a single cohesive platform, establishing the foundations for shared services, data isolation, and long-term scalability.

### 1.1 Product Suite

The three products and internal dashboard are derived from the aviation domain entities already present in the codebase (flights, expenses, crew, aircraft, routes):

| Product | Description | Key Domain Entities |
|---------|-------------|---------------------|
| **CrewExpense** | Pilot and crew expense tracking with receipt management, flight linking, reporting, and CSV export. *(Existing frontend.)* | Expenses, Receipts, Categories, Flights |
| **FlightOps** | Flight operations management — scheduling, route planning, aircraft assignment, and operational status tracking. | Flights, Aircraft, Routes, Airports, Crew Assignments |
| **CrewPortal** | Crew self-service — duty rosters, qualification tracking, document management (licenses, medicals), and leave requests. | Crew Members, Qualifications, Documents, Schedules |
| **AdminDashboard** | Internal tool for XYZ Empresa operations staff — tenant management, billing oversight, platform analytics, and support. | Tenants, Users, Billing, Audit Logs |

### 1.2 Constraints

- Small team — architecture must minimize operational burden.
- Aviation domain demands strong data consistency and auditability.
- Multi-tenant: each airline customer is a tenant; their data must be isolated.
- The existing frontend is vanilla JS; the backend choice should not force a frontend rewrite but should support progressive migration.

---

## 2. Key Architectural Decisions

### 2.1 Monorepo Modular Monolith (not Microservices)

**Decision:** Use a monorepo containing a modular monolith backend, with clearly separated domain modules that can be extracted into services later if needed.

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| **A. Monorepo modular monolith** | Single deployment, shared tooling, easy cross-module refactoring, one CI pipeline, low ops overhead | Must enforce module boundaries with discipline; risk of coupling if boundaries aren't respected |
| **B. Monorepo with separate microservices** | Strong boundary enforcement, independent scaling | Premature for a small team; network overhead, distributed transactions, complex CI/CD, operational burden of multiple deployments |
| **C. Polyrepo microservices** | Maximum isolation | Maximum coordination overhead; versioning hell; impractical for a small team |

**Rationale:** The three products share significant domain overlap (flights, crew, expenses all reference each other). A modular monolith lets us ship fast with a single deployment while maintaining clear internal boundaries through TypeScript module structure and dependency rules. When a module proves it needs independent scaling (e.g., notification throughput), it can be extracted with the interfaces already in place.

**Consequences:**
- Easier: cross-cutting changes (schema migrations, shared auth logic), local development, debugging.
- Harder: a single module's resource spike affects the whole process (mitigated by horizontal scaling behind a load balancer).

---

### 2.2 Technology Stack

**Decision:** Node.js (TypeScript) + PostgreSQL + Redis, deployed as containers.

#### Runtime & Language

| Option | Pros | Cons |
|--------|------|------|
| **Node.js + TypeScript** | Team continuity (existing JS frontend), massive ecosystem, excellent async I/O for API workloads, shared types between frontend and backend | Single-threaded CPU-bound bottleneck (mitigated by worker threads / horizontal scaling) |
| **Go** | High performance, small binaries, strong concurrency | New language for the team; no type sharing with frontend; smaller ORM ecosystem |
| **Python (FastAPI)** | Rapid prototyping, rich data/analytics libraries | GIL limits concurrency; type safety less mature; runtime performance lower than Node/Go for API workloads |

**Choice: Node.js + TypeScript.** The existing frontend is JavaScript. TypeScript gives us type safety, and shared type definitions between API and frontend reduce integration bugs. The API workload (CRUD, filtering, aggregation) is I/O-bound, which is Node's strength.

#### Framework

| Option | Pros | Cons |
|--------|------|------|
| **NestJS** | Opinionated modular structure (aligns with modular monolith), built-in DI, guards, interceptors; large community | Steeper learning curve; heavier abstraction layer |
| **Express + manual structure** | Minimal, widely known | No built-in module system; discipline required to maintain boundaries |
| **Fastify** | High performance, schema-based validation | Smaller ecosystem than Express; less opinionated |

**Choice: NestJS.** Its module system directly maps to our domain modules (CrewExpense, FlightOps, CrewPortal, Admin). Built-in dependency injection, guards (for auth), and interceptors (for audit logging) align with our cross-cutting concerns. The opinionated structure prevents the modular monolith from degrading into a big ball of mud.

#### Database

| Option | Pros | Cons |
|--------|------|------|
| **PostgreSQL** | ACID transactions, Row-Level Security for multi-tenancy, rich indexing (GIN, GiST for geo), mature ecosystem, JSON support | Vertical scaling limits (mitigated by read replicas + connection pooling) |
| **MySQL** | Widely deployed, good performance | Weaker RLS support; less rich type system |
| **MongoDB** | Flexible schema, horizontal scaling | Weak transactions across collections; aviation data is highly relational; eventual consistency risks |

**Choice: PostgreSQL.** Aviation data is inherently relational (flights ↔ crew ↔ expenses ↔ aircraft). Financial data (expenses, billing) demands ACID. PostgreSQL's Row-Level Security is the foundation of our tenant isolation strategy (see §2.4). JSON columns handle semi-structured data (receipt metadata, notification payloads) without needing a separate document store.

#### ORM

**Choice: Prisma.** Type-safe query builder with auto-generated TypeScript types from the schema, migration tooling, and strong PostgreSQL support. Integrates cleanly with NestJS.

#### Cache / Transient State

**Choice: Redis.** Session cache, rate limiting, background job queues (via BullMQ), and pub/sub for real-time notifications. Single dependency that covers multiple transient-state needs.

#### Full Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 20 LTS + TypeScript 5.x | Application runtime |
| Framework | NestJS 10+ | API framework, module system, DI |
| Database | PostgreSQL 16 | Primary data store |
| ORM | Prisma | Type-safe DB access, migrations |
| Cache / Queue | Redis 7 | Caching, sessions, job queues |
| Job Queue | BullMQ (on Redis) | Async jobs: notifications, reports |
| File Storage | S3-compatible (AWS S3 / MinIO) | Receipts, documents, exports |
| API Protocol | REST (OpenAPI 3.1) | Client-facing API |
| Auth | JWT (access) + opaque (refresh), bcrypt | Authentication tokens |
| Containerization | Docker + Docker Compose (dev), ECS or Cloud Run (prod) | Deployment |
| CI/CD | GitHub Actions | Build, test, deploy pipeline |

---

### 2.3 Shared Services

These cross-cutting concerns are implemented as NestJS modules within the monolith, not as separate services.

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway (NestJS)                     │
│                     /api/v1/* route prefix                      │
├────────┬────────────┬──────────────┬───────────────────────────-─┤
│ CrewExpense │ FlightOps │  CrewPortal  │    AdminDashboard        │
│  Module     │  Module   │   Module     │      Module              │
├─────────────┴───────────┴──────────────┴────────────────────────-┤
│                     Shared Service Modules                       │
│  ┌──────────┐ ┌──────────────┐ ┌─────────┐ ┌────────────────┐   │
│  │   Auth   │ │ Notification │ │ Billing │ │  File Storage  │   │
│  │  Module  │ │    Module    │ │  Module │ │    Module      │   │
│  └──────────┘ └──────────────┘ └─────────┘ └────────────────┘   │
│  ┌──────────┐ ┌──────────────┐ ┌──────────────────────────────┐ │
│  │  Audit   │ │   Tenant     │ │     Common (utils, DTOs,     │ │
│  │  Module  │ │   Module     │ │     exceptions, filters)     │ │
│  └──────────┘ └──────────────┘ └──────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     Data Layer (Prisma + PostgreSQL)             │
│                     Redis (Cache + Queue)                        │
│                     S3 (File Storage)                            │
└─────────────────────────────────────────────────────────────────┘
```

#### Shared Service Responsibilities

| Service Module | Responsibilities | Key APIs |
|----------------|------------------|----------|
| **Auth** | User registration/login, JWT issuance/validation, refresh token rotation, password hashing (bcrypt), RBAC role assignment, OAuth2 provider integration (future), session invalidation | `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout` |
| **Tenant** | Tenant (airline) provisioning, tenant context resolution from JWT/subdomain, tenant-scoped configuration (timezone, currency, logo), tenant lifecycle (suspend, delete) | `POST /admin/tenants`, `GET /admin/tenants/:id`, `PATCH /admin/tenants/:id` |
| **Notification** | Email (transactional: password reset, expense approval, roster changes), in-app notifications, notification preferences per user, delivery via BullMQ async jobs | `POST /notifications/send`, `GET /notifications`, `PATCH /notifications/:id/read` |
| **Billing** | Subscription plan management, usage tracking (per-tenant seat count), invoice generation, payment integration (Stripe), plan enforcement (feature gating), webhook handling | `GET /billing/plans`, `POST /billing/subscriptions`, `GET /billing/invoices` |
| **File Storage** | Pre-signed URL generation for uploads/downloads, file metadata tracking, receipt/document association with domain entities, virus scanning (via ClamAV job), size/type validation | `POST /files/upload-url`, `GET /files/:id/download-url`, `DELETE /files/:id` |
| **Audit** | Immutable append-only audit log for all write operations, who/what/when/from-where, queryable by tenant and entity, retention policy enforcement | `GET /admin/audit-logs` (query), automatic logging via NestJS interceptor |
| **Common** | Shared DTOs, exception filters, pagination helpers, date/currency formatting, request validation pipes | N/A (library module, not exposed via API) |

---

### 2.4 Data Isolation Strategy

**Decision:** Shared database, shared schema, tenant isolation via Row-Level Security (RLS) and a mandatory `tenant_id` column on all tenant-scoped tables.

**Options Considered:**

| Option | Pros | Cons |
|--------|------|------|
| **A. Database-per-tenant** | Strongest isolation; simple backup/restore per tenant | Operational nightmare at scale (connection pooling, migrations across N databases, provisioning latency) |
| **B. Schema-per-tenant** | Good isolation; per-tenant backup possible | Migration complexity grows linearly with tenants; connection pool fragmentation |
| **C. Shared schema + RLS** | Single migration path, single connection pool, simple ops, scales to thousands of tenants | Must enforce `tenant_id` on every query; a bug in RLS policy = data leak |

**Choice: Option C — Shared schema + RLS.** For an early-stage platform targeting dozens-to-hundreds of airline tenants, operational simplicity wins. PostgreSQL RLS policies enforce isolation at the database level as a safety net, while the application layer (NestJS Tenant Module) sets the session variable (`app.current_tenant_id`) on every request.

#### Implementation Pattern

```sql
-- Every tenant-scoped table includes:
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON expenses
  USING (tenant_id = current_setting('app.current_tenant_id')::uuid);

-- The Prisma middleware sets this on every connection:
-- SET LOCAL app.current_tenant_id = '<tenant-uuid>';
```

#### Table Classification

| Scope | Examples | `tenant_id`? |
|-------|----------|--------------|
| **Tenant-scoped** | expenses, flights, crew_members, aircraft, schedules, documents, notifications | Yes — RLS enforced |
| **Platform-global** | tenants, plans, platform_users (super-admins), audit_logs | No — restricted to admin module only |

#### Safeguards Against Data Leaks

1. **PostgreSQL RLS** — enforced at database level; even raw SQL can't bypass it.
2. **NestJS TenantGuard** — middleware that extracts `tenant_id` from JWT, sets PostgreSQL session variable, and rejects requests with missing/invalid tenant context.
3. **Prisma middleware** — injects `tenant_id` filter on all queries as application-layer defense-in-depth.
4. **Integration tests** — test suite verifies that Tenant A's API calls never return Tenant B's data.

---

## 3. Architecture Diagram

### 3.1 System Context (All Products + Dashboard)

```
                            ┌────────────────────┐
                            │   Aviation Airline  │
                            │    Customers        │
                            │  (multi-tenant)     │
                            └────────┬───────────-┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐  ┌──────▼──────┐  ┌─────▼──────┐
              │ CrewExpense│  │  FlightOps  │  │ CrewPortal │
              │   (SPA)   │  │   (SPA)     │  │   (SPA)    │
              └─────┬─────┘  └──────┬──────┘  └─────┬──────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    │ HTTPS / REST
                                    ▼
                    ┌───────────────────────────────-┐
                    │        Load Balancer           │
                    │    (TLS termination, rate      │
                    │     limiting, WAF)             │
                    └───────────────┬────────────────┘
                                    │
                    ┌───────────────▼────────────────┐
                    │     NestJS Monolith API        │
                    │     (horizontally scaled,      │
                    │      N container instances)    │
                    │                                │
                    │  ┌──────────────────────────┐  │
                    │  │    Product Modules        │  │
                    │  │  ┌──────────┐ ┌────────┐ │  │
                    │  │  │CrewExpense│ │FlightOps│ │  │
                    │  │  └──────────┘ └────────┘ │  │
                    │  │  ┌──────────┐ ┌────────┐ │  │
                    │  │  │CrewPortal│ │  Admin  │ │  │
                    │  │  └──────────┘ └────────┘ │  │
                    │  └──────────────────────────┘  │
                    │  ┌──────────────────────────┐  │
                    │  │    Shared Services        │  │
                    │  │  Auth · Tenant · Billing  │  │
                    │  │  Notification · Files     │  │
                    │  │  Audit · Common           │  │
                    │  └──────────────────────────┘  │
                    └──────┬──────────┬──────────────┘
                           │          │
                ┌──────────▼──┐  ┌────▼────────┐
                │ PostgreSQL  │  │    Redis     │
                │ (primary +  │  │  (cache,     │
                │  read       │  │   sessions,  │
                │  replicas)  │  │   job queue) │
                └─────────────┘  └─────────────┘
                                        │
            ┌───────────────────────┐    │
            │   S3 / MinIO          │    │
            │ (receipts, documents, │    │
            │  exports)             │    │
            └───────────────────────┘    │
                                    ┌────▼──────────┐
                                    │   BullMQ      │
                                    │   Workers     │
                                    │ (email, PDF   │
                                    │  reports,     │
                                    │  cleanup)     │
                                    └───────────────┘

        ┌──────────────────────────────────────────┐
        │          AdminDashboard (SPA)            │
        │   (internal users only — VPN/IP-gated)   │
        │   Connects to same API with admin role   │
        └──────────────────────────────────────────┘
```

### 3.2 Monorepo Directory Structure

```
xyz-empresa/
├── apps/
│   ├── api/                          # NestJS application entry point
│   │   ├── src/
│   │   │   ├── main.ts               # Bootstrap
│   │   │   ├── app.module.ts          # Root module, imports all feature + shared modules
│   │   │   └── config/               # Environment config, validation
│   │   ├── Dockerfile
│   │   └── tsconfig.json
│   ├── worker/                       # BullMQ worker process
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   └── processors/           # Job processors (email, PDF, cleanup)
│   │   └── Dockerfile
│   └── frontend/                     # Future: SPA (or stays static for now)
│       └── ...
│
├── libs/                             # Shared NestJS modules (importable by apps)
│   ├── auth/                         # AuthModule: JWT, guards, RBAC
│   │   ├── src/
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   ├── strategies/
│   │   │   │   └── jwt.strategy.ts
│   │   │   └── decorators/
│   │   │       ├── current-user.decorator.ts
│   │   │       └── roles.decorator.ts
│   │   └── index.ts
│   ├── tenant/                       # TenantModule: context resolution, RLS setup
│   ├── billing/                      # BillingModule: Stripe integration, plans
│   ├── notification/                 # NotificationModule: email, in-app
│   ├── file-storage/                 # FileStorageModule: S3 pre-signed URLs
│   ├── audit/                        # AuditModule: interceptor, log queries
│   ├── common/                       # Shared DTOs, exceptions, pipes, utils
│   └── database/                     # PrismaModule: client, middleware, migrations
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── src/
│           ├── database.module.ts
│           ├── prisma.service.ts
│           └── tenant.middleware.ts   # Sets RLS session variable
│
├── modules/                          # Product-specific domain modules
│   ├── crew-expense/                 # CrewExpense product module
│   │   ├── src/
│   │   │   ├── crew-expense.module.ts
│   │   │   ├── controllers/
│   │   │   │   ├── expenses.controller.ts
│   │   │   │   └── categories.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── expenses.service.ts
│   │   │   │   └── categories.service.ts
│   │   │   └── dto/
│   │   └── index.ts
│   ├── flight-ops/                   # FlightOps product module
│   │   ├── src/
│   │   │   ├── flight-ops.module.ts
│   │   │   ├── controllers/
│   │   │   │   ├── flights.controller.ts
│   │   │   │   ├── aircraft.controller.ts
│   │   │   │   └── routes.controller.ts
│   │   │   ├── services/
│   │   │   └── dto/
│   │   └── index.ts
│   ├── crew-portal/                  # CrewPortal product module
│   │   ├── src/
│   │   │   ├── crew-portal.module.ts
│   │   │   ├── controllers/
│   │   │   │   ├── roster.controller.ts
│   │   │   │   ├── qualifications.controller.ts
│   │   │   │   └── leave.controller.ts
│   │   │   ├── services/
│   │   │   └── dto/
│   │   └── index.ts
│   └── admin/                        # AdminDashboard module
│       ├── src/
│       │   ├── admin.module.ts
│       │   ├── controllers/
│       │   │   ├── tenants.controller.ts
│       │   │   ├── users.controller.ts
│       │   │   └── analytics.controller.ts
│       │   ├── services/
│       │   └── dto/
│       └── index.ts
│
├── docker-compose.yml                # Local dev: API + PostgreSQL + Redis + MinIO
├── package.json                      # Workspace root
├── tsconfig.base.json
├── nx.json or turbo.json             # Monorepo task runner
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint, test, build
│       └── deploy.yml                # Container build + deploy
└── docs/
    └── architecture/
        └── ADR-001-backend-infrastructure.md   # This document
```

### 3.3 Data Model Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                      Platform-Global Tables                          │
│                                                                      │
│  tenants              plans               platform_admins            │
│  ├── id (PK)          ├── id (PK)         ├── id (PK)               │
│  ├── name             ├── name            ├── email                  │
│  ├── slug             ├── price           ├── password_hash          │
│  ├── status           ├── features (JSON) └── role                   │
│  ├── plan_id (FK)     └── seat_limit                                 │
│  └── created_at                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                  Tenant-Scoped Tables (RLS enforced)                  │
│                  All tables below have tenant_id (FK)                 │
│                                                                      │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐           │
│  │   users     │    │   flights    │    │   aircraft     │           │
│  │ ├── id      │    │ ├── id       │    │ ├── id         │           │
│  │ ├── email   │    │ ├── code     │    │ ├── registration│          │
│  │ ├── name    │◄───│ ├── pilot_id │    │ ├── type       │           │
│  │ ├── role    │    │ ├── aircraft ─┼───►│ └── status     │           │
│  │ └── ...     │    │ ├── route    │    └────────────────┘           │
│  └──────┬──────┘    │ ├── date     │                                 │
│         │           │ └── status   │                                 │
│         │           └──────┬───────┘                                 │
│         │                  │                                         │
│  ┌──────▼──────┐    ┌──────▼───────┐    ┌────────────────┐           │
│  │  expenses   │    │  schedules   │    │ qualifications │           │
│  │ ├── id      │    │ ├── id       │    │ ├── id         │           │
│  │ ├── user_id │    │ ├── user_id  │    │ ├── user_id    │           │
│  │ ├── flight  │    │ ├── flight   │    │ ├── type       │           │
│  │ ├── amount  │    │ ├── duty_type│    │ ├── expiry     │           │
│  │ ├── category│    │ └── date     │    │ └── document   │           │
│  │ └── receipt │    └──────────────┘    └────────────────┘           │
│  └─────────────┘                                                     │
│                                                                      │
│  ┌─────────────┐    ┌──────────────┐    ┌────────────────┐           │
│  │ categories  │    │   documents  │    │ notifications  │           │
│  │ ├── id      │    │ ├── id       │    │ ├── id         │           │
│  │ ├── name    │    │ ├── user_id  │    │ ├── user_id    │           │
│  │ └── ...     │    │ ├── type     │    │ ├── channel    │           │
│  └─────────────┘    │ ├── file_key │    │ ├── payload    │           │
│                     │ └── status   │    │ └── read_at    │           │
│                     └──────────────┘    └────────────────┘           │
│                                                                      │
│  ┌──────────────────────────────────┐                                │
│  │         audit_logs               │                                │
│  │ ├── id                           │                                │
│  │ ├── tenant_id                    │                                │
│  │ ├── user_id                      │                                │
│  │ ├── action (CREATE/UPDATE/DELETE)│                                │
│  │ ├── entity_type                  │                                │
│  │ ├── entity_id                    │                                │
│  │ ├── changes (JSONB)             │                                │
│  │ ├── ip_address                   │                                │
│  │ └── created_at                   │                                │
│  └──────────────────────────────────┘                                │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. Scalability Considerations

### 4.1 Horizontal Scaling

| Component | Scaling Strategy |
|-----------|-----------------|
| **API (NestJS)** | Stateless — scale horizontally behind load balancer. Session state in Redis, not in-process. Target: start with 2 instances, auto-scale on CPU/request latency. |
| **PostgreSQL** | Vertical scaling initially. Add read replicas for reporting queries (CrewExpense reports, admin analytics). Connection pooling via PgBouncer (or Prisma connection pool) to handle N API instances. |
| **Redis** | Single instance for initial scale. Redis Sentinel or managed Redis (ElastiCache) for HA. |
| **BullMQ Workers** | Scale independently from API. Add workers for specific queues (email, PDF generation) based on queue depth. |
| **File Storage** | S3 scales automatically. Pre-signed URLs offload bandwidth from the API. |

### 4.2 Performance Targets (Initial)

| Metric | Target |
|--------|--------|
| API response time (p95) | < 200ms |
| Database query time (p95) | < 50ms |
| Concurrent tenants | 100+ |
| Concurrent users per tenant | 500+ |
| File upload size limit | 25 MB |

### 4.3 Caching Strategy

| Cache Layer | What | TTL | Invalidation |
|-------------|------|-----|-------------|
| **Redis** | Tenant config, user sessions, RBAC permissions | 15 min | On write (cache-aside) |
| **Redis** | Expense category lists (per tenant) | 5 min | On category add/remove |
| **HTTP** | Static assets (CSS/JS), API GETs with ETag | varies | ETag-based conditional requests |
| **None** | Write operations, financial data | — | Never cached — always read from DB |

### 4.4 Future Scaling Path

When the platform outgrows the modular monolith:
1. **Extract notifications** first — highest candidate for independent scaling; already queue-based with BullMQ.
2. **Extract file processing** — virus scanning, thumbnail generation are CPU-bound; natural fit for a separate worker service.
3. **Read replicas** for reporting — route admin analytics and CSV export queries to read replicas.
4. The monolith core (auth, tenant, CRUD APIs) is the last to split — it benefits most from co-location.

---

## 5. Security Considerations

### 5.1 Authentication & Authorization

| Concern | Implementation |
|---------|---------------|
| **Authentication** | JWT access tokens (15 min expiry) + opaque refresh tokens (7 day, stored hashed in DB). Passwords hashed with bcrypt (cost factor 12). |
| **Authorization** | RBAC with roles: `super_admin`, `tenant_admin`, `manager`, `pilot`, `crew`. Role checked via NestJS `RolesGuard` on every endpoint. |
| **Tenant isolation** | JWT contains `tenant_id` claim. TenantGuard sets PostgreSQL session variable for RLS. No endpoint can operate outside its tenant context. |
| **Admin access** | AdminDashboard endpoints require `super_admin` role and are additionally IP-restricted (VPN/allowlist). |
| **Session management** | Refresh token rotation — every refresh issues a new token and invalidates the old one. Logout invalidates all active sessions for the user. |

### 5.2 API Security

| Concern | Implementation |
|---------|---------------|
| **Rate limiting** | Per-IP and per-tenant rate limits via Redis-backed `@nestjs/throttler`. Tighter limits on auth endpoints (login: 5/min, register: 3/min). |
| **Input validation** | All request payloads validated via `class-validator` DTOs with whitelist mode (strip unknown fields). File uploads validated for type and size before processing. |
| **CORS** | Strict origin allowlist per environment. No wildcard in production. |
| **SQL injection** | Prisma parameterized queries. RLS as additional safety layer. No raw SQL in application code without explicit review. |
| **XSS** | API returns JSON only; frontend is responsible for output encoding. Content-Security-Policy headers set at load balancer. |
| **HTTPS** | TLS termination at load balancer. HSTS headers enforced. |
| **Dependency security** | `npm audit` in CI pipeline. Dependabot or Renovate for automated dependency updates. |

### 5.3 Data Security

| Concern | Implementation |
|---------|---------------|
| **Encryption at rest** | PostgreSQL with encrypted storage volumes. S3 server-side encryption (SSE-S3). |
| **Encryption in transit** | TLS 1.2+ everywhere. Internal traffic between API and database encrypted via SSL. |
| **PII handling** | User PII (email, name) stored in `users` table with access limited to auth and admin modules. No PII in logs. |
| **Audit trail** | All write operations logged to `audit_logs` table via NestJS interceptor. Immutable (no UPDATE/DELETE on audit_logs). Retained for 7 years (aviation compliance). |
| **Backup** | Automated daily PostgreSQL backups with point-in-time recovery (PITR). Backup retention: 30 days. Cross-region backup for disaster recovery. |
| **Secrets management** | Environment variables for local dev. Managed secrets service (AWS Secrets Manager / GCP Secret Manager) for production. No secrets in code or version control. |

### 5.4 Aviation-Specific Compliance Notes

- Expense records and flight logs may be subject to audit by aviation authorities — the immutable audit log and backup strategy supports this.
- Crew qualification documents (licenses, medicals) have expiry dates — the system must enforce notification before expiry and prevent assignment of unqualified crew to flights.
- All timestamps stored in UTC; displayed in tenant-configured timezone.

---

## 6. API Design Conventions

| Convention | Detail |
|-----------|--------|
| **Base URL** | `https://api.xyzempresa.com/api/v1` |
| **Versioning** | URL-path versioning (`/api/v1/`, `/api/v2/`) |
| **Auth** | `Authorization: Bearer <jwt>` header |
| **Pagination** | Cursor-based for lists: `?cursor=<id>&limit=25` |
| **Filtering** | Query params: `?category=Fuel&dateFrom=2025-01-01` |
| **Errors** | RFC 7807 problem details: `{ type, title, status, detail }` |
| **Naming** | kebab-case URLs, camelCase JSON fields |

### Key Endpoints by Product

```
# CrewExpense
GET    /api/v1/expenses
POST   /api/v1/expenses
GET    /api/v1/expenses/:id
DELETE /api/v1/expenses/:id
GET    /api/v1/expenses/export/csv
GET    /api/v1/categories
POST   /api/v1/categories

# FlightOps
GET    /api/v1/flights
POST   /api/v1/flights
GET    /api/v1/flights/:id
PATCH  /api/v1/flights/:id
GET    /api/v1/aircraft
POST   /api/v1/aircraft

# CrewPortal
GET    /api/v1/roster
GET    /api/v1/qualifications
POST   /api/v1/leave-requests
GET    /api/v1/documents

# Admin
GET    /api/v1/admin/tenants
POST   /api/v1/admin/tenants
GET    /api/v1/admin/analytics
GET    /api/v1/admin/audit-logs

# Shared
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/files/upload-url
GET    /api/v1/notifications
```

---

## 7. Migration Path from Current Frontend

The existing vanilla JS frontend (`index.html`, `expense-form.html`, `reports.html`) uses localStorage. The migration to the backend API is incremental:

1. **Phase 1:** Deploy the API with the CrewExpense module. Create an API adapter in `js/app.js` that swaps localStorage calls for `fetch()` calls to the REST API. The HTML/CSS/JS frontend stays as-is — only the data layer changes.

2. **Phase 2:** Add authentication. Wrap the API adapter with a login flow (JWT stored in an httpOnly cookie or in-memory). Add a login page.

3. **Phase 3:** Build FlightOps and CrewPortal as new SPAs (React or Next.js) that consume the same API. The existing CrewExpense frontend can be migrated to the same SPA framework when the team is ready.

4. **Phase 4:** Build the AdminDashboard as a separate internal SPA.

This approach avoids a big-bang rewrite. The existing frontend continues to work throughout the migration.

---

## 8. Decisions Not Taken (and Why)

| Decision | Why Not |
|----------|---------|
| **GraphQL** | The API is CRUD-oriented with well-defined resources. REST is simpler, more cacheable, and the team has no GraphQL experience. Reconsider if frontend teams request flexible querying. |
| **Event sourcing** | Adds significant complexity (event store, projections, replay). The audit log table covers the compliance requirement without the architectural overhead. |
| **Multi-region deployment** | Premature. Start single-region. If latency for international airlines becomes an issue, add CDN for static assets first, then evaluate multi-region database (CockroachDB or Postgres logical replication). |
| **gRPC for internal communication** | There is no internal communication — it's a monolith. If services are extracted later, gRPC is a strong candidate for inter-service calls. |
| **Kubernetes** | Over-engineered for initial scale. Docker Compose for dev, ECS/Cloud Run for prod. Migrate to K8s when the team has more than 10 services or needs advanced scheduling. |

---

## 9. Summary of Decisions

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | Monorepo modular monolith | Shared domain, small team, low ops overhead |
| 2 | Node.js + TypeScript + NestJS | Team continuity, type safety, modular framework |
| 3 | PostgreSQL + Prisma | Relational aviation data, ACID for financials, RLS for tenancy |
| 4 | Redis + BullMQ | Cache, sessions, async job queue in one dependency |
| 5 | Shared schema + RLS for tenant isolation | Operational simplicity, single migration path, DB-level enforcement |
| 6 | JWT + RBAC for auth | Stateless scaling, role-based product access |
| 7 | S3-compatible file storage | Offload bandwidth, pre-signed URLs, scalable |
| 8 | REST (OpenAPI) for API | Simple, cacheable, well-understood by team |
| 9 | Immutable audit log | Aviation compliance, accountability |
| 10 | Incremental frontend migration | No big-bang rewrite; swap data layer progressively |
