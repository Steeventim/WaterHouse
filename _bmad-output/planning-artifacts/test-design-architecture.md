# Test Design for Architecture: WaterHouse

**Purpose:** Architectural concerns, testability gaps, and NFR requirements for review by Architecture/Dev teams. Serves as a contract between QA and Engineering on what must be addressed before test development begins.

**Date:** 26 janvier 2026
**Author:** Murat (tea agent)
**Status:** Architecture Review Pending
**Project:** WaterHouse
**PRD Reference:** /home/tims/Dev1.0/WaterHouse/\_bmad-output/planning-artifacts/prd.md
**ADR Reference:** /home/tims/Dev1.0/WaterHouse/\_bmad-output/planning-artifacts/architecture.md

---

## Executive Summary

**Scope:** Offline-first mobile app for meter reading in Africa with backend billing and SMS integration.

**Business Context** (from PRD):

- **Revenue/Impact:** Billing system for utilities in Africa
- **Problem:** Offline meter reading in areas with poor connectivity
- **GA Launch:** Not specified

**Architecture** (from ADR):

- **Key Decision 1:** Offline-first React Native mobile app with local SQLite
- **Key Decision 2:** NestJS backend with modular monolith and bounded contexts
- **Key Decision 3:** Sync mechanism for offline data reconciliation

**Expected Scale** (from ADR):

- Medium traffic, regional deployment in Africa

**Risk Summary:**

- **Total risks**: 18
- **High-priority (≥6)**: 12 risks requiring immediate mitigation
- **Test effort**: ~25 tests (~5 weeks for 1 QA)
- **Overall NFR readiness**: ⚠️ CONCERNS (12/29 criteria met = 41%)

---

## Quick Guide

### 🚨 BLOCKERS - Team Must Decide (Can't Proceed Without)

**Sprint 0 Critical Path** - These MUST be completed before QA can write integration tests:

1. **R-001: Test Data Seeding APIs** - Implement `/api/test-data` endpoints for injecting specific data states (e.g., user with expired subscription) (recommended owner: Backend Dev)
2. **R-002: Mock Endpoints for External APIs** - Provide mock/stub endpoints for Africa's Talking SMS API and Supabase storage to enable isolated testing (recommended owner: Backend Dev)
3. **R-003: Multi-Tenant Data Segregation** - Implement customer_id scoping in all queries to prevent test data pollution (recommended owner: Backend Dev)

**What we need from team:** Complete these 3 items in Sprint 0 or test development is blocked.

---

### ⚠️ HIGH PRIORITY - Team Should Validate (We Provide Recommendation, You Approve)

1. **R-004: SLA Definition** - Define target availability (e.g., 99.5%) and redundancy strategy (recommended: Railway multi-zone, approve by PM)
2. **R-005: Latency Targets** - Define P95/P99 latency SLOs for API endpoints (recommended: P95 <2s, approve by Dev)
3. **R-006: Disaster Recovery Plan** - Define RTO/RPO and backup strategy (recommended: RTO 4h, RPO 1h, approve by DevOps)

**What we need from team:** Review recommendations and approve (or suggest changes).

---

### 📋 INFO ONLY - Solutions Provided (Review, No Decisions Needed)

1. **Test strategy**: API-first with mobile E2E for critical paths (Rationale: Offline-first requires API validation)
2. **Tooling**: Playwright for E2E, Jest for unit, Supertest for API
3. **Tiered CI/CD**: Unit (fast), API integration (medium), E2E with sync (slow)
4. **Coverage**: ~25 test scenarios prioritized P0-P3 with risk-based classification
5. **Quality gates**: 90% coverage, no high-severity security issues, sync accuracy >99%

**What we need from team:** Just review and acknowledge (we already have the solution).

---

## For Architects and Devs - Open Topics 👷

### Risk Assessment

**Total risks identified**: 18 (12 high-priority score ≥6, 4 medium, 2 low)

#### High-Priority Risks (Score ≥6) - IMMEDIATE ATTENTION

| Risk ID   | Category           | Description                                | Probability | Impact | Score | Mitigation                                | Owner       | Timeline |
| --------- | ------------------ | ------------------------------------------ | ----------- | ------ | ----- | ----------------------------------------- | ----------- | -------- |
| **R-001** | **Testability**    | No seeding APIs for test data states       | 2           | 3      | **6** | Implement `/api/test-data` endpoints      | Backend Dev | Sprint 0 |
| **R-002** | **Testability**    | No mock endpoints for Africa's Talking API | 2           | 3      | **6** | Provide stub endpoints for SMS API        | Backend Dev | Sprint 0 |
| **R-003** | **Test Data**      | No multi-tenant isolation for test data    | 3           | 2      | **6** | Add customer_id to all queries            | Backend Dev | Sprint 0 |
| **R-004** | **Availability**   | SLA undefined, no redundancy strategy      | 3           | 2      | **6** | Define 99.5% SLA, multi-zone Railway      | PM          | Sprint 1 |
| **R-005** | **Performance**    | No latency targets defined                 | 2           | 3      | **6** | Set P95 <2s, P99 <5s SLOs                 | Dev         | Sprint 1 |
| **R-006** | **DR**             | No RTO/RPO defined                         | 2           | 3      | **6** | Define RTO 4h, RPO 1h                     | DevOps      | Sprint 1 |
| **R-007** | **Security**       | Secrets management not specified           | 2           | 3      | **6** | Use Railway env vars or Vault             | Dev         | Sprint 1 |
| **R-008** | **Monitorability** | No metrics endpoint for RED metrics        | 2           | 3      | **6** | Add /metrics with Prometheus format       | Dev         | Sprint 1 |
| **R-009** | **Testability**    | No sample API requests documented          | 2           | 3      | **6** | Add cURL examples to ADR                  | PM          | Sprint 1 |
| **R-010** | **Scalability**    | Bottlenecks not identified under load      | 2           | 3      | **6** | Load test with k6, monitor DB connections | Dev         | Sprint 1 |
| **R-011** | **QoS**            | No rate limiting for API endpoints         | 2           | 3      | **6** | Implement per-user rate limiting          | Dev         | Sprint 1 |
| **R-012** | **DR**             | Backups not validated for restoration      | 1           | 4      | **4** | Test PostgreSQL backup restore monthly    | DevOps      | Sprint 2 |

#### Medium-Priority Risks (Score 3-5)

| Risk ID | Category       | Description                             | Probability | Impact | Score | Mitigation                          | Owner      |
| ------- | -------------- | --------------------------------------- | ----------- | ------ | ----- | ----------------------------------- | ---------- |
| R-013   | Testability    | Synthetic data generation not specified | 2           | 2      | 4     | Use Faker for test data             | QA         |
| R-014   | Monitorability | Dynamic log levels not implemented      | 2           | 2      | 4     | Add Winston log level config        | Dev        |
| R-015   | QoE            | No optimistic updates in mobile UI      | 1           | 3      | 3     | Add skeleton screens for loading    | Mobile Dev |
| R-016   | Deployability  | Zero-downtime deployment not specified  | 2           | 1      | 2     | Use Railway blue/green if available | DevOps     |

#### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description                            | Probability | Impact | Score | Action  |
| ------- | -------- | -------------------------------------- | ----------- | ------ | ----- | ------- |
| R-017   | Security | Input validation details not specified | 1           | 2      | 2     | Monitor |
| R-018   | Tracing  | No distributed tracing implemented     | 1           | 1      | 1     | Monitor |

#### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **Testability**: Testability & Automation
- **Test Data**: Test Data Strategy
- **Availability**: Scalability & Availability
- **DR**: Disaster Recovery
- **Security**: Security
- **Monitorability**: Monitorability, Debuggability & Manageability
- **Performance**: QoS (Quality of Service) & QoE (Quality of Experience)
- **QoS**: QoS & QoE
- **QoE**: QoS & QoE
- **Deployability**: Deployability

---

## NFR Testability Requirements

**Based on ADR Quality Readiness Checklist (8 categories, 29 criteria)**

### 1. Testability & Automation (1/4 criteria met)

| Criterion       | Status     | Gap/Requirement                                  | Risk if Unmet                                  |
| --------------- | ---------- | ------------------------------------------------ | ---------------------------------------------- |
| Isolation       | ⚠️ Gap     | Mock endpoints for Africa's Talking and Supabase | Flaky tests; inability to test in isolation    |
| Headless        | ✅ Covered | All business logic accessible via NestJS API     | N/A                                            |
| State Control   | ⚠️ Gap     | Seeding APIs for test data injection             | Long setup times; inability to test edge cases |
| Sample Requests | ⚠️ Gap     | cURL/JSON samples not provided in ADR            | Ambiguity on API consumption                   |

### 2. Test Data Strategy (1/3 criteria met)

| Criterion   | Status | Gap/Requirement                   | Risk if Unmet                       |
| ----------- | ------ | --------------------------------- | ----------------------------------- |
| Segregation | ⚠️ Gap | Multi-tenant headers or scoping   | Test data pollution; skewed metrics |
| Generation  | ⚠️ Gap | Synthetic data strategy undefined | Dependency on production data       |
| Teardown    | ⚠️ Gap | Automated cleanup mechanism       | Environment rot; test failures      |

### 3. Scalability & Availability (1/4 criteria met)

| Criterion        | Status     | Gap/Requirement                        | Risk if Unmet                  |
| ---------------- | ---------- | -------------------------------------- | ------------------------------ |
| Statelessness    | ✅ Covered | JWT-based auth, no server sessions     | N/A                            |
| Bottlenecks      | ⚠️ Gap     | Weakest links not identified           | System crash under load        |
| SLA              | ⚠️ Gap     | Availability target undefined          | Breach of service expectations |
| Circuit Breakers | ⚠️ Gap     | No fail-fast for external API failures | Cascading failures             |

### 4. Disaster Recovery (0/3 criteria met)

| Criterion | Status | Gap/Requirement               | Risk if Unmet           |
| --------- | ------ | ----------------------------- | ----------------------- |
| RTO/RPO   | ⚠️ Gap | Recovery objectives undefined | Extended outages        |
| Failover  | ⚠️ Gap | No multi-region strategy      | Single point of failure |
| Backups   | ⚠️ Gap | Restoration not tested        | Data loss on failure    |

### 5. Security (2/4 criteria met)

| Criterion        | Status          | Gap/Requirement               | Risk if Unmet             |
| ---------------- | --------------- | ----------------------------- | ------------------------- |
| AuthN/AuthZ      | ✅ Covered      | JWT with role-based access    | N/A                       |
| Encryption       | ✅ Covered      | TLS in transit assumed        | N/A                       |
| Secrets          | ⚠️ Gap          | Management strategy undefined | Credential leaks          |
| Input Validation | ⬜ Not Assessed | Details not specified         | Injection vulnerabilities |

### 6. Monitorability (1/4 criteria met)

| Criterion | Status          | Gap/Requirement            | Risk if Unmet          |
| --------- | --------------- | -------------------------- | ---------------------- |
| Tracing   | ⚠️ Gap          | No W3C Trace Context       | Difficult debugging    |
| Logs      | ✅ Covered      | Winston structured logging | N/A                    |
| Metrics   | ⚠️ Gap          | No RED metrics exposed     | Blind to system health |
| Config    | ⬜ Not Assessed | Externalization assumed    | Rigid configuration    |

### 7. QoS & QoE (0/4 criteria met)

| Criterion             | Status          | Gap/Requirement                 | Risk if Unmet        |
| --------------------- | --------------- | ------------------------------- | -------------------- |
| Latency               | ⚠️ Gap          | P95/P99 targets undefined       | Slow performance     |
| Throttling            | ⚠️ Gap          | No rate limiting                | DDoS vulnerability   |
| Perceived Performance | ⚠️ Gap          | No skeletons/optimistic updates | Poor user experience |
| Degradation           | ⬜ Not Assessed | Error handling assumed          | Raw errors to users  |

### 8. Deployability (1/3 criteria met)

| Criterion              | Status     | Gap/Requirement               | Risk if Unmet       |
| ---------------------- | ---------- | ----------------------------- | ------------------- |
| Zero Downtime          | ⚠️ Gap     | Deployment strategy undefined | Maintenance windows |
| Backward Compatibility | ✅ Covered | TypeORM migrations separate   | N/A                 |
| Rollback               | ⚠️ Gap     | No automated rollback         | Prolonged outages   |

**Overall Assessment:** 7/29 criteria met (24%) → ⚠️ CONCERNS

**Gate Decision:** CONCERNS (requires mitigation plan before test development)

**Next Actions:**

- [ ] Backend: Implement test data seeding APIs (R-001)
- [ ] Backend: Add mock endpoints for external dependencies (R-002)
- [ ] Dev: Define SLA and latency targets (R-004, R-005)
- [ ] DevOps: Plan disaster recovery (R-006)
- [ ] QA: Begin test development after blockers resolved
