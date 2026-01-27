---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ["prd.md", "product-brief-WaterHouse-2026-01-26.md"]
workflowType: "architecture"
date: "2026-01-26"
author: "Winston, Architect"
lastStep: 8
status: "complete"
completedAt: "2026-01-26"
---

# Architecture Document - WaterHouse

**Project:** WaterHouse  
**Date:** 26 January 2026  
**Architect:** Winston

## Step 1: Initialization

Workflow initialized with input documents loaded:

- Product Requirements Document (PRD)
- Product Brief

Ready for context analysis.

## Step 2: Project Context Analysis

**Analyse du contexte projet (améliorée via Cross-Functional War Room) :**

**Exigences du PRD :**

- Application mobile Android pour releveurs (offline-first, robuste sur low-end devices)
- Backend web pour gestionnaires (interface intuitive, dashboards simples)
- Calcul automatique de factures avec tarifs configurables par immeuble
- Envoi SMS/email avec PDF (fiable malgré réseaux instables)
- Traçabilité complète (photos horodatées, logs d'envoi)
- Mode hors-ligne complet avec sync delta
- Gestion initiale 100-5000 logements, croissance progressive

**Contraintes identifiées (avec trade-offs) :**

- **Équipe petite (<6 devs) :** Modular Monolith privilégié vs microservices (simplicité vs scalabilité)
- **Contexte Afrique francophone :** Réseaux instables, Android dominant, SMS prioritaire (adaptation vs standardisation)
- **Budget maîtrisé :** Solutions cloud abordables (Railway, Supabase) vs enterprise (coût vs fiabilité)
- **MVP rapide (3-6 mois) :** Focus fonctionnalités core vs architecture parfaite (vitesse vs qualité)

**Implications architecturales :**

- **Style :** Modular Monolith → séparation bounded contexts pour évolution (simplicité maintenant, options futures)
- **Technologies :** React Native + NestJS + PostgreSQL → stack moderne maintenable (performance vs coût)
- **Bounded Contexts :** 8 composants (Auth, Catalog, Relevé, Billing, Messaging, Reporting, Audit, Configuration)
- **Roadmap :** MVP monolith → extraction Billing/Messaging → mature microservices (progressif vs big bang)

**Points de décision clés :**

- Sync offline robuste avec gestion conflits (fiabilité vs complexité)
- Billing engine configurable (flexibilité vs performance)
- Messaging multi-canal (Africa's Talking + fallback) (local vs global)
- Évolutivité : extraction services basée sur load (préventif vs réactif)

## Step 3: Starter Template Selection

**Choix du template : Full-Stack Monorepo**

- **Raison :** Alignement avec contraintes équipe petite et MVP rapide
- **Avantages :** Développement unifié, tooling partagé, déploiement simplifié
- **Structure :** Monorepo avec apps/mobile (React Native) et apps/api (NestJS)
- **Outils :** Nx workspace, shared libs, unified CI/CD

**Technologies validées (versions actuelles) :**

- React Native v0.83.1 (stable)
- NestJS v11.1.12 (latest)
- PostgreSQL v18.1 (latest)
- Africa's Talking API (current stable)
- Railway + Supabase (platform-managed)

## Step 4: System Architecture Design

### Architecture Overview

**Style : Modular Monolith**

```
┌─────────────────────────────────────────────────────────────┐
│                    WaterHouse System                        │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Bounded Contexts                          │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │ │
│  │  │  Auth   │ │ Catalog │ │ Relevé  │ │ Billing │       │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │ │
│  │                                                         │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │ │
│  │  │Messaging│ │Reporting│ │  Audit  │ │   Config│       │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Shared Infrastructure                      │ │
│  │  • PostgreSQL Database                                 │ │
│  │  • Africa's Talking SMS                                 │ │
│  │  • Railway (API) + Supabase (Mobile)                   │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Mobile Application (React Native)

**Architecture : Offline-First**

- **State Management :** Redux Toolkit + RTK Query
- **Storage :** SQLite (react-native-sqlite-storage)
- **Sync :** Background sync with conflict resolution
- **UI :** React Native Paper (Material Design)
- **Navigation :** React Navigation v6

**Key Features :**

- Meter reading capture with photo validation
- Offline queue management
- GPS location tracking
- Multi-language support (French/English)

### Backend API (NestJS)

**Architecture : Modular Monolith**

- **Framework :** NestJS v11.1.12
- **Database :** PostgreSQL v18.1 with TypeORM
- **Authentication :** JWT + Refresh tokens
- **Validation :** class-validator + class-transformer
- **Documentation :** Swagger/OpenAPI

**Modules par Bounded Context :**

- **Auth :** User management, roles (collector/manager)
- **Catalog :** Buildings, apartments, meters, tariffs
- **Relevé :** Reading submissions, validation, history
- **Billing :** Invoice calculation, PDF generation
- **Messaging :** Africa's Talking integration, templates
- **Reporting :** Dashboards, analytics, exports
- **Audit :** Activity logs, compliance tracking
- **Configuration :** System settings, feature flags

### Database Design

**PostgreSQL Schema :**

```sql
-- Core entities
CREATE TABLE buildings (id, name, address, manager_id);
CREATE TABLE apartments (id, building_id, number, tenant_info);
CREATE TABLE meters (id, apartment_id, type, serial_number);
CREATE TABLE readings (id, meter_id, value, photo_url, timestamp, collector_id);
CREATE TABLE invoices (id, apartment_id, amount, period, status, pdf_url);
CREATE TABLE users (id, username, role, building_access[]);

-- Messaging
CREATE TABLE sms_logs (id, recipient, message, status, provider_response);
CREATE TABLE email_logs (id, recipient, subject, status, attachment_url);
```

### Deployment Architecture

**Production Setup :**

- **API :** Railway (Node.js hosting, PostgreSQL included)
- **Mobile :** App Store + Google Play
- **Database :** Railway PostgreSQL (managed)
- **Storage :** Supabase Storage (photos, PDFs)
- **Messaging :** Africa's Talking direct integration

**Development Setup :**

- **Local :** Docker Compose (API + PostgreSQL)
- **Mobile :** Expo development builds
- **CI/CD :** GitHub Actions → Railway deploy

### Security Considerations

**Authentication & Authorization :**

- JWT tokens with refresh mechanism
- Role-based access (collector, manager, admin)
- API rate limiting, CORS configuration

**Data Protection :**

- Encrypted sensitive data (payment info, personal data)
- GDPR compliance for EU operations
- Secure file storage with access controls

### Performance & Scalability

**Initial MVP (100-5000 units) :**

- Single Railway instance (512MB RAM, 1 CPU)
- PostgreSQL connection pooling
- CDN for static assets (photos, PDFs)

**Growth Path :**

- Horizontal scaling preparation
- Database read replicas
- Service extraction (Billing, Messaging) based on load

### Monitoring & Observability

**Logging :**

- Structured logging with Winston
- Error tracking with Sentry
- Performance monitoring

**Metrics :**

- API response times
- Database query performance
- Mobile app crash reports
- SMS delivery success rates

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- Base de données PostgreSQL v18.1 avec schéma relationnel
- Authentification JWT avec gestion des rôles
- API REST avec documentation OpenAPI

**Important Decisions (Shape Architecture):**

- Architecture modulaire monolith avec 8 bounded contexts
- Stockage offline-first avec SQLite et sync
- Intégration Africa's Talking pour SMS

**Deferred Decisions (Post-MVP):**

- Cache distribué (Redis si nécessaire)
- Réplicas de lecture base de données
- Extraction de services (Billing, Messaging)

### Data Architecture

- **Database choice:** PostgreSQL v18.1 (latest stable)
- **Data modeling:** Relational schema with core entities (buildings, apartments, meters, readings, invoices, users)
- **Data validation:** TypeORM + class-validator
- **Migration approach:** TypeORM migrations
- **Caching strategy:** Not specified (can be added with Redis if needed)

### Authentication & Security

- **Authentication method:** JWT tokens with refresh mechanism
- **Authorization patterns:** Role-based access (collector, manager, admin)
- **Security middleware:** Rate limiting, CORS configuration
- **Data encryption:** Encrypted sensitive data (payment info, personal data)
- **API security:** JWT validation, role-based permissions

### API & Communication Patterns

- **API design patterns:** REST with Swagger/OpenAPI documentation
- **Error handling standards:** NestJS standard error responses
- **Rate limiting strategy:** Configured at API level
- **Communication between services:** Synchronous (modular monolith)

### Frontend Architecture

- **State management:** Redux Toolkit + RTK Query
- **Component architecture:** React Native with Material Design (Paper)
- **Routing strategy:** React Navigation v6
- **Performance optimization:** Offline-first with background sync
- **Bundle optimization:** Standard React Native bundling

### Infrastructure & Deployment

- **Hosting strategy:** Railway (API) + Supabase (mobile storage)
- **CI/CD pipeline:** GitHub Actions to Railway deployment
- **Environment configuration:** Environment variables
- **Monitoring and logging:** Winston structured logging, Sentry error tracking
- **Scaling strategy:** Single instance initially, horizontal scaling preparation

### Decision Impact Analysis

**Implementation Sequence:**

1. Authentification et base de données (fondation)
2. API REST avec modules bounded contexts
3. Application mobile avec stockage offline
4. Intégration SMS Africa's Talking
5. Déploiement et monitoring

**Cross-Component Dependencies:**

- Authentification affecte tous les modules API
- Stockage offline mobile dépend de la sync API
- Intégration SMS liée au module Billing

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 8 areas where AI agents could make different choices

### Naming Patterns

**Database Naming Conventions:**

- Tables: snake_case (users, apartments, meter_readings)
- Columns: snake_case (user_id, created_at, is_active)
- Foreign keys: table_id format (user_id, apartment_id)
- Indexes: idx_table_column (idx_users_email)

**API Naming Conventions:**

- Endpoints: plural nouns (/users, /apartments)
- Route params: :id format (/users/:id)
- Query params: camelCase (userId, isActive)
- Headers: X-Custom-Header format

**Code Naming Conventions:**

- Components: PascalCase (UserCard, MeterReadingForm)
- Files: PascalCase for components, camelCase for utils (UserCard.tsx, apiClient.ts)
- Functions: camelCase (getUserData, calculateInvoice)
- Variables: camelCase (userId, isLoading)

### Structure Patterns

**Project Organization:**

- Tests: Co-located (\*.test.ts next to implementation files)
- Components: Feature-based (/features/Auth/LoginForm.tsx)
- Shared code: /shared/ directory (utils, types, constants)
- Services: /services/ directory with one file per bounded context

**File Structure Patterns:**

- Config: /config/ directory (database.config.ts, app.config.ts)
- Assets: /assets/ directory with subfolders (images/, icons/)
- Docs: /docs/ directory for project documentation

### Format Patterns

**API Response Formats:**

- Success: { data: T, error: null }
- Error: { data: null, error: { message: string, code: number } }
- Pagination: { data: T[], meta: { page, limit, total } }

**Data Exchange Formats:**

- JSON fields: camelCase (userId, createdAt)
- Booleans: true/false
- Nulls: Explicit null for optional fields
- Arrays: Always arrays, empty [] for no items

### Communication Patterns

**Event System Patterns:**

- Event names: camelCase (userLoggedIn, readingSubmitted)
- Payload structure: { type: string, payload: any, timestamp: ISO string }
- Event versioning: Append version (userLoggedIn.v2)

**State Management Patterns:**

- Actions: SCREAMING_SNAKE_CASE (USER_LOGIN_SUCCESS)
- State updates: Immutable (using spread operator)
- Selectors: camelCase (selectCurrentUser, selectUnreadCount)

### Process Patterns

**Error Handling Patterns:**

- Global: Error boundary components in React Native
- API: Centralized error interceptor in NestJS
- User messages: Localized error messages from constants
- Logging: Structured with Winston (level, message, context)

**Loading State Patterns:**

- Naming: isLoading, isSubmitting, isFetching
- Global: Redux slice for global loading state
- Local: Component-level loading states
- UI: Consistent loading spinners/indicators

### Enforcement Guidelines

**All AI Agents MUST:**

- Follow established naming conventions in all code
- Use co-located tests for all new features
- Implement consistent error handling patterns
- Document any deviations from patterns

**Pattern Enforcement:**

- Code reviews check for pattern compliance
- ESLint rules enforce naming conventions
- Automated tests verify API response formats
- Pattern violations documented in issues

### Pattern Examples

**Good Examples:**

```typescript
// API Response
{ data: { userId: 123, name: "John" }, error: null }

// Database table
CREATE TABLE users (id SERIAL, name VARCHAR, created_at TIMESTAMP);

// Component structure
/features/Auth/LoginForm.tsx
/features/Auth/LoginForm.test.tsx
```

**Anti-Patterns:**

- Mixed naming: user_id in JSON, userId in database
- Scattered tests: /tests/ separate from implementation
- Inconsistent errors: Sometimes {error}, sometimes {message}

## Project Structure & Boundaries

### Complete Project Directory Structure

```
waterhouse/
├── README.md
├── package.json
├── nx.json
├── tsconfig.base.json
├── .gitignore
├── .env.example
├── .github/
│   └── workflows/
│       ├── ci-mobile.yml
│       ├── ci-api.yml
│       └── deploy.yml
├── apps/
│   ├── mobile/
│   │   ├── App.tsx
│   │   ├── package.json
│   │   ├── metro.config.js
│   │   ├── babel.config.js
│   │   ├── tsconfig.json
│   │   ├── index.js
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ui/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── TextInput.tsx
│   │   │   │   │   └── Card.tsx
│   │   │   │   └── features/
│   │   │   │       ├── auth/
│   │   │   │       │   ├── LoginForm.tsx
│   │   │   │       │   ├── LoginForm.test.tsx
│   │   │   │       │   └── UserProfile.tsx
│   │   │   │       ├── catalog/
│   │   │   │       │   ├── BuildingList.tsx
│   │   │   │       │   ├── ApartmentCard.tsx
│   │   │   │       │   └── MeterCard.tsx
│   │   │   │       ├── releve/
│   │   │   │       │   ├── ReadingForm.tsx
│   │   │   │       │   ├── PhotoCapture.tsx
│   │   │   │       │   └── OfflineQueue.tsx
│   │   │   │       ├── billing/
│   │   │   │       │   ├── InvoiceList.tsx
│   │   │   │       │   └── InvoiceDetail.tsx
│   │   │   │       ├── messaging/
│   │   │   │       │   ├── SmsStatus.tsx
│   │   │   │       │   └── NotificationBadge.tsx
│   │   │   │       ├── reporting/
│   │   │   │       │   ├── Dashboard.tsx
│   │   │   │       │   └── AnalyticsChart.tsx
│   │   │   │       ├── audit/
│   │   │   │       │   ├── ActivityLog.tsx
│   │   │   │       │   └── ComplianceReport.tsx
│   │   │   │       └── configuration/
│   │   │   │           ├── SettingsForm.tsx
│   │   │   │           └── FeatureToggle.tsx
│   │   │   ├── services/
│   │   │   │   ├── api/
│   │   │   │   │   ├── apiClient.ts
│   │   │   │   │   ├── authApi.ts
│   │   │   │   │   └── syncApi.ts
│   │   │   │   ├── database/
│   │   │   │   │   ├── sqlite.ts
│   │   │   │   │   └── migrations.ts
│   │   │   │   └── storage/
│   │   │   │       └── supabaseStorage.ts
│   │   │   ├── store/
│   │   │   │   ├── index.ts
│   │   │   │   ├── slices/
│   │   │   │   │   ├── authSlice.ts
│   │   │   │   │   ├── catalogSlice.ts
│   │   │   │   │   ├── releveSlice.ts
│   │   │   │   │   ├── billingSlice.ts
│   │   │   │   │   ├── messagingSlice.ts
│   │   │   │   │   ├── reportingSlice.ts
│   │   │   │   │   ├── auditSlice.ts
│   │   │   │   │   └── configurationSlice.ts
│   │   │   │   └── selectors/
│   │   │   │       ├── authSelectors.ts
│   │   │   │       └── catalogSelectors.ts
│   │   │   ├── types/
│   │   │   │   ├── index.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── catalog.ts
│   │   │   │   ├── releve.ts
│   │   │   │   ├── billing.ts
│   │   │   │   ├── messaging.ts
│   │   │   │   ├── reporting.ts
│   │   │   │   ├── audit.ts
│   │   │   │   └── configuration.ts
│   │   │   ├── utils/
│   │   │   │   ├── dateUtils.ts
│   │   │   │   ├── validationUtils.ts
│   │   │   │   └── offlineUtils.ts
│   │   │   ├── constants/
│   │   │   │   ├── apiConstants.ts
│   │   │   │   └── uiConstants.ts
│   │   │   ├── navigation/
│   │   │   │   ├── AppNavigator.tsx
│   │   │   │   └── types.ts
│   │   │   └── hooks/
│   │   │       ├── useAuth.ts
│   │   │       ├── useOfflineSync.ts
│   │   │       └── useApi.ts
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── fonts/
│   │   ├── android/
│   │   │   ├── app/
│   │   │   ├── gradle/
│   │   │   └── src/
│   │   └── ios/
│   │       ├── WaterHouse/
│   │       ├── WaterHouseTests/
│       └── WaterHouseUITests/
│   ├── api/
│   │   ├── package.json
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   ├── .env
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── app.controller.ts
│   │   │   ├── app.service.ts
│   │   │   ├── config/
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── jwt.config.ts
│   │   │   │   ├── app.config.ts
│   │   │   │   └── africa-talking.config.ts
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── jwt.strategy.ts
│   │   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── login.dto.ts
│   │   │   │   │       └── register.dto.ts
│   │   │   │   ├── catalog/
│   │   │   │   │   ├── catalog.module.ts
│   │   │   │   │   ├── catalog.controller.ts
│   │   │   │   │   ├── catalog.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   ├── building.entity.ts
│   │   │   │   │   │   ├── apartment.entity.ts
│   │   │   │   │   │   └── meter.entity.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       ├── create-building.dto.ts
│   │   │   │   │       └── update-apartment.dto.ts
│   │   │   │   ├── releve/
│   │   │   │   │   ├── releve.module.ts
│   │   │   │   │   ├── releve.controller.ts
│   │   │   │   │   ├── releve.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── reading.entity.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       └── submit-reading.dto.ts
│   │   │   │   ├── billing/
│   │   │   │   │   ├── billing.module.ts
│   │   │   │   │   ├── billing.controller.ts
│   │   │   │   │   ├── billing.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── invoice.entity.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       └── generate-invoice.dto.ts
│   │   │   │   ├── messaging/
│   │   │   │   │   ├── messaging.module.ts
│   │   │   │   │   ├── messaging.controller.ts
│   │   │   │   │   ├── messaging.service.ts
│   │   │   │   │   ├── africa-talking.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       └── send-sms.dto.ts
│   │   │   │   ├── reporting/
│   │   │   │   │   ├── reporting.module.ts
│   │   │   │   │   ├── reporting.controller.ts
│   │   │   │   │   ├── reporting.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       └── report-query.dto.ts
│   │   │   │   ├── audit/
│   │   │   │   │   ├── audit.module.ts
│   │   │   │   │   ├── audit.controller.ts
│   │   │   │   │   ├── audit.service.ts
│   │   │   │   │   ├── entities/
│   │   │   │   │   │   └── audit-log.entity.ts
│   │   │   │   │   └── dto/
│   │   │   │   │       └── audit-query.dto.ts
│   │   │   │   └── configuration/
│   │   │   │       ├── configuration.module.ts
│   │   │   │       ├── configuration.controller.ts
│   │   │       ├── configuration.service.ts
│   │   │       ├── entities/
│   │   │       │   └── config.entity.ts
│   │   │       └── dto/
│   │   │           └── update-config.dto.ts
│   │   ├── shared/
│   │   │   ├── decorators/
│   │   │   ├── pipes/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── filters/
│   │   │   └── utils/
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   └── seeds/
│   │   └── common/
│   │       ├── interfaces/
│   │       ├── enums/
│   │       └── constants/
│   ├── test/
│   │   ├── unit/
│   │   ├── integration/
│   │   └── e2e/
│   └── docker-compose.yml
├── libs/
│   ├── shared-types/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── lib/
│   │   │   └── types.ts
│   │   └── project.json
│   ├── shared-utils/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   │   ├── lib/
│   │   │   │   └── utils.ts
│   │   │   └── project.json
│   └── shared-validation/
│       ├── src/
│       ├── index.ts
│       ├── lib/
│       └── validation.ts
│       └── project.json
├── tools/
│   ├── executors/
│   └── generators/
├── docs/
│   ├── api/
│   ├── mobile/
│   └── deployment/
└── docker/
    ├── Dockerfile.api
    ├── Dockerfile.mobile
    └── docker-compose.dev.yml
```

### Architectural Boundaries

**API Boundaries:**

- Endpoints externes : /api/v1/\* (authentifiés)
- Services internes : Modules NestJS avec injection de dépendances
- Authentification : JWT avec guards et stratégies
- Accès données : Repositories avec TypeORM

**Component Boundaries:**

- Communication frontend : Redux actions et selectors
- Navigation : React Navigation avec types TypeScript
- Services : API client centralisé avec interceptors
- Stockage : SQLite pour offline, Supabase pour fichiers

**Service Boundaries:**

- Auth : Gestion utilisateurs et sessions
- Catalog : Données immobilières (bâtiments, appartements, compteurs)
- Relevé : Saisie et validation des relevés
- Billing : Calcul et génération de factures
- Messaging : Envoi SMS/email via Africa's Talking
- Reporting : Tableaux de bord et analyses
- Audit : Traçabilité et conformité
- Configuration : Paramètres système

**Data Boundaries:**

- Base PostgreSQL : Schéma relationnel avec migrations
- Cache : Préparé pour Redis (différé)
- Fichiers : Supabase Storage pour photos/PDFs
- Offline : SQLite mobile avec sync delta

### Requirements to Structure Mapping

**Feature/Epic Mapping:**

- Authentification : apps/mobile/src/features/auth/, apps/api/src/modules/auth/
- Gestion immobilière : apps/mobile/src/features/catalog/, apps/api/src/modules/catalog/
- Relevés de compteurs : apps/mobile/src/features/releve/, apps/api/src/modules/releve/
- Facturation : apps/mobile/src/features/billing/, apps/api/src/modules/billing/
- Messagerie : apps/mobile/src/features/messaging/, apps/api/src/modules/messaging/
- Rapports : apps/mobile/src/features/reporting/, apps/api/src/modules/reporting/
- Audit : apps/mobile/src/features/audit/, apps/api/src/modules/audit/
- Configuration : apps/mobile/src/features/configuration/, apps/api/src/modules/configuration/

**Cross-Cutting Concerns:**

- Authentification : Guards, interceptors, et composants partagés
- Gestion d'erreurs : Error boundaries React, filtres NestJS
- Logging : Winston intégré dans tous les services
- Validation : DTOs NestJS, utils de validation partagés

### Integration Points

**Internal Communication:**

- API ↔ Mobile : REST avec JWT, sync bidirectionnelle
- Modules API : Injection de dépendances NestJS
- État mobile : Redux avec RTK Query pour API calls

**External Integrations:**

- Africa's Talking : Service dédié dans messaging module
- Supabase : Storage pour fichiers, auth optionnel
- Railway : Hébergement API et base de données

**Data Flow:**

- Mobile → API : Sync des relevés avec gestion conflits
- API → Mobile : Push des factures et notifications
- Base de données : Accès direct via repositories

### File Organization Patterns

**Configuration Files:**

- Racine : package.json, nx.json, .env.example
- Apps : Configs spécifiques (metro.config.js, nest-cli.json)
- Environnements : .env par environnement

**Source Organization:**

- Mobile : Feature-based avec composants, services, types
- API : Module-based avec controllers, services, entities
- Shared : Libs Nx pour code réutilisable

**Test Organization:**

- Co-localisés : \*.test.ts à côté des fichiers
- Intégration : test/integration/ pour tests API
- E2E : test/e2e/ pour scénarios complets

**Asset Organization:**

- Mobile : assets/ avec images, icônes, polices
- API : Static files via Railway/Supabase
- Docs : docs/ avec sous-dossiers par domaine

### Development Workflow Integration

**Development Server Structure:**

- Nx : Commandes unifiées (nx serve mobile, nx serve api)
- Hot reload : Metro pour mobile, NestJS pour API
- Debugging : VS Code configs pour les deux apps

**Build Process Structure:**

- Nx : Builds parallèles et optimisés
- Mobile : Build Android/iOS avec assets
- API : Build Node.js optimisé pour Railway

**Deployment Structure:**

- CI/CD : GitHub Actions avec déploiements séparés
- Mobile : App Store + Google Play
- API : Railway avec migrations automatiques

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**

- Technologies compatibles : React Native v0.83.1 + NestJS v11.1.12 + PostgreSQL v18.1
- Versions validées via recherche web, pas de conflits détectés
- Patterns alignés avec le stack technologique choisi
- Décisions cohérentes : monolith modulaire avec préparation extraction services

**Pattern Consistency:**

- Patterns d'implémentation supportent les décisions architecturales
- Conventions de nommage cohérentes (snake_case DB, camelCase API/JS)
- Structure patterns alignés avec Nx monorepo
- Patterns de communication cohérents (Redux + RTK Query)

**Structure Alignment:**

- Structure projet supporte toutes les décisions architecturales
- Frontières architecturales clairement définies (bounded contexts)
- Structure permet les patterns choisis (feature-based mobile, module-based API)
- Points d'intégration correctement structurés

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**

- Authentification : Gestion utilisateurs avec JWT et rôles
- Gestion immobilière : Catalogue bâtiments/appartements/compteurs
- Relevés compteurs : Saisie offline avec validation photos
- Facturation : Calcul automatique avec génération PDF
- Messagerie : Intégration Africa's Talking pour SMS/email
- Rapports : Tableaux de bord et analyses
- Audit : Traçabilité complète des actions
- Configuration : Paramètres système flexibles

**Functional Requirements Coverage:**

- Application mobile Android offline-first : ✅ React Native + SQLite
- Backend web pour gestionnaires : ✅ NestJS + interface dashboards
- Calcul factures automatique : ✅ Engine configurable par immeuble
- Envoi SMS/email fiable : ✅ Africa's Talking avec fallback
- Traçabilité complète : ✅ Photos horodatées + logs d'envoi
- Mode offline complet : ✅ Sync delta avec gestion conflits
- Gestion 100-5000 logements : ✅ Architecture scalable

**Non-Functional Requirements Coverage:**

- Performance : ✅ Optimisations offline, connection pooling, CDN préparé
- Sécurité : ✅ JWT, chiffrement données sensibles, conformité GDPR
- Évolutivité : ✅ Préparation scaling horizontal, extraction services
- Fiabilité : ✅ Gestion erreurs, logging structuré, monitoring

### Implementation Readiness Validation ✅

**Decision Completeness:**

- Toutes les décisions critiques documentées avec versions
- Patterns d'implémentation complets et applicables
- Règles de cohérence claires et exécutables
- Exemples fournis pour tous les patterns majeurs

**Structure Completeness:**

- Structure projet complète et spécifique (tous fichiers/répertoires définis)
- Frontières composants clairement spécifiées
- Points d'intégration détaillés
- Mappings exigences → structure complets

**Pattern Completeness:**

- Tous les points de conflit potentiels adressés
- Conventions de nommage complètes (DB, API, code)
- Patterns de communication fully spécifiés
- Patterns de process complets (gestion erreurs, états loading)

### Gap Analysis Results

**Critical Gaps:** Aucun - toutes les décisions bloquantes sont prises

**Important Gaps:** Aucun - architecture complète pour MVP

**Nice-to-Have Gaps:**

- Cache Redis pour optimisations futures
- Monitoring avancé (New Relic, DataDog)
- Tests de performance automatisés
- Documentation API interactive (Redoc)

### Validation Issues Addressed

Aucun problème critique trouvé. L'architecture est prête pour l'implémentation.

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Contexte projet analysé en profondeur
- [x] Échelle et complexité évaluées
- [x] Contraintes techniques identifiées
- [x] Préoccupations transversales mappées

**✅ Architectural Decisions**

- [x] Décisions critiques documentées avec versions
- [x] Stack technologique fully spécifié
- [x] Patterns d'intégration définis
- [x] Considérations performance adressées

**✅ Implementation Patterns**

- [x] Conventions de nommage établies
- [x] Patterns de structure définis
- [x] Patterns de communication spécifiés
- [x] Patterns de process documentés

**✅ Project Structure**

- [x] Structure répertoire complète définie
- [x] Frontières composants établies
- [x] Points d'intégration mappés
- [x] Mappings exigences → structure complets

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High - architecture complète et cohérente

**Key Strengths:**

- Stack technologique moderne et éprouvé
- Architecture offline-first robuste pour contexte africain
- Patterns de cohérence complets pour équipes IA
- Structure projet claire et détaillée
- Considérations sécurité et performance intégrées

**Areas for Future Enhancement:**

- Cache distribué pour montée en charge
- Monitoring avancé et observabilité
- Tests de performance continus
- Microservices extraction progressive

### Implementation Handoff

**AI Agent Guidelines:**

- Suivre toutes les décisions architecturales exactement comme documentées
- Utiliser les patterns d'implémentation de manière consistante
- Respecter la structure projet et les frontières
- Se référer à ce document pour toutes les questions architecturales

**First Implementation Priority:**
Commencer par la configuration Nx monorepo et les modules d'authentification de base.

## Step 5: Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)

- [ ] Monorepo setup with Nx
- [ ] Database schema design & migrations
- [ ] Authentication module (NestJS)
- [ ] Basic mobile app structure (React Native)

### Phase 2: Core Features (Weeks 5-8)

- [ ] Catalog management (buildings, apartments, meters)
- [ ] Meter reading capture (mobile + offline)
- [ ] Billing calculation engine
- [ ] Africa's Talking SMS integration

### Phase 3: Advanced Features (Weeks 9-12)

- [ ] PDF invoice generation
- [ ] Reporting dashboards
- [ ] Audit logging
- [ ] Multi-language support

### Phase 4: Production (Weeks 13-16)

- [ ] Testing & QA
- [ ] Deployment setup (Railway + Supabase)
- [ ] Performance optimization
- [ ] Security audit

**Total Timeline : 4 months**
**Team Size : 3-4 developers**
**Risk Level : Medium (proven technologies, incremental delivery)**
