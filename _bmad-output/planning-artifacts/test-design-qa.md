# Test Design for QA: WaterHouse

**Purpose:** Test execution recipe for QA team. Defines what to test, how to test it, and what QA needs from other teams.

**Date:** 26 janvier 2026
**Author:** Murat (tea agent)
**Status:** Draft
**Project:** WaterHouse

**Related:** See Architecture doc (test-design-architecture.md) for testability concerns and architectural blockers.

---

## Executive Summary

**Scope:** Test design for offline-first mobile meter reading app with backend billing and SMS integration.

**Risk Summary:**

- Total Risks: 18 (12 high-priority score ≥6, 4 medium, 2 low)
- Critical Categories: Testability, Security, Performance, Availability

**Coverage Summary:**

- P0 tests: ~12 (critical paths, security)
- P1 tests: ~8 (important features, integration)
- P2 tests: ~4 (edge cases, regression)
- P3 tests: ~1 (exploratory, benchmarks)
- **Total**: ~25 tests (~4-5 weeks with 1 QA)

---

## Dependencies & Test Blockers

**CRITICAL:** QA cannot proceed without these items from other teams.

### Backend/Architecture Dependencies (Sprint 0)

**Source:** See Architecture doc "Quick Guide" for detailed mitigation plans

1. **Test Data Seeding APIs** - Backend Dev - Sprint 0
   - `/api/test-data` endpoints for injecting edge case data states
   - Blocks all integration and system tests requiring specific data

2. **Mock Endpoints for External APIs** - Backend Dev - Sprint 0
   - Stub endpoints for Africa's Talking SMS and Supabase storage
   - Blocks isolated testing and CI stability

3. **Multi-Tenant Data Isolation** - Backend Dev - Sprint 0
   - `customer_id` scoping in all database queries
   - Blocks parallel test execution and production metric pollution

### QA Infrastructure Setup (Sprint 0)

1. **Test Data Factories** - QA
   - Meter, user, billing factories with faker-based randomization
   - Auto-cleanup fixtures for parallel test safety

2. **Test Environments** - QA
   - Local: React Native emulator + NestJS dev server + PostgreSQL local
   - CI/CD: GitHub Actions with Railway staging
   - Staging: Full Railway deployment with test data

**Example factory pattern:**

```typescript
import { test } from "@playwright/test";
import { faker } from "@faker-js/faker";

test("example meter reading test @p0", async ({ apiRequest }) => {
  const testData = {
    meterId: `test-${faker.string.uuid()}`,
    reading: faker.number.int({ min: 1000, max: 9999 }),
    location: faker.location.city(),
  };

  const { status } = await apiRequest({
    method: "POST",
    path: "/api/meter-reading",
    body: testData,
  });

  expect(status).toBe(201);
});
```

---

## Risk Assessment

**Note:** Full risk details in Architecture doc. This section summarizes risks relevant to QA test planning.

### High-Priority Risks (Score ≥6)

| Risk ID   | Category       | Description                   | Score | QA Test Coverage                                       |
| --------- | -------------- | ----------------------------- | ----- | ------------------------------------------------------ |
| **R-001** | Testability    | No seeding APIs for test data | **6** | API tests for data injection, validation of edge cases |
| **R-002** | Testability    | No mocks for external APIs    | **6** | Isolated service tests, CI stability                   |
| **R-003** | Test Data      | No multi-tenant isolation     | **6** | Parallel test execution, data cleanup validation       |
| **R-004** | Availability   | SLA undefined                 | **6** | Uptime monitoring, redundancy tests                    |
| **R-005** | Performance    | No latency targets            | **6** | Response time assertions, load tests                   |
| **R-006** | DR             | No RTO/RPO defined            | **6** | Backup restore tests, failover simulation              |
| **R-007** | Security       | Secrets management undefined  | **6** | Credential leak tests, env var validation              |
| **R-008** | Monitorability | No metrics endpoint           | **6** | Health check tests, metric exposure validation         |
| **R-009** | Testability    | No sample API requests        | **6** | API contract tests, documentation validation           |
| **R-010** | Scalability    | Bottlenecks not identified    | **6** | Load tests, connection pool monitoring                 |
| **R-011** | QoS            | No rate limiting              | **6** | Rate limit tests, DDoS simulation                      |
| **R-012** | DR             | Backups not tested            | **4** | Backup integrity tests                                 |

### Medium/Low-Priority Risks

| Risk ID | Category       | Description                  | Score | QA Test Coverage                 |
| ------- | -------------- | ---------------------------- | ----- | -------------------------------- |
| R-013   | Testability    | Synthetic data undefined     | 4     | Data generation validation       |
| R-014   | Monitorability | Dynamic logs not implemented | 4     | Log level configuration tests    |
| R-015   | QoE            | No optimistic updates        | 3     | UI loading state tests           |
| R-016   | Deployability  | Zero-downtime undefined      | 2     | Deployment smoke tests           |
| R-017   | Security       | Input validation unspecified | 2     | Injection attack tests           |
| R-018   | Tracing        | No distributed tracing       | 1     | Correlation ID propagation tests |

---

## Test Coverage Plan

**IMPORTANT:** P0/P1/P2/P3 = **priority and risk level** (what to focus on if time-constrained), NOT execution timing. See "Execution Strategy" for when tests run.

### P0 (Critical)

**Criteria:** Blocks core functionality + High risk (≥6) + No workaround + Affects majority of users

| Test ID    | Requirement                   | Test Level  | Risk Link | Notes                                   |
| ---------- | ----------------------------- | ----------- | --------- | --------------------------------------- |
| **P0-001** | User authentication with JWT  | System      | R-007     | Multi-device sync validation            |
| **P0-002** | Meter reading offline storage | System      | R-001     | SQLite persistence, sync reconciliation |
| **P0-003** | Billing calculation accuracy  | Integration | R-010     | Complex pricing rules, rounding         |
| **P0-004** | SMS notification delivery     | Integration | R-002     | Africa's Talking API integration        |
| **P0-005** | Data sync conflict resolution | System      | R-003     | Offline edits, merge conflicts          |
| **P0-006** | API security (authz)          | Unit        | R-007     | RBAC for meter access                   |
| **P0-007** | Database connection pooling   | Integration | R-010     | Under load, no connection leaks         |
| **P0-008** | Rate limiting enforcement     | System      | R-011     | Prevent abuse, return 429               |
| **P0-009** | Backup restore integrity      | System      | R-012     | Data consistency post-restore           |
| **P0-010** | Health checks pass            | Unit        | R-008     | /health endpoint, dependencies          |
| **P0-011** | Latency <2s P95               | Performance | R-005     | API response times                      |
| **P0-012** | Secrets not exposed           | Security    | R-007     | No leaks in logs/errors                 |

**Total P0:** ~12 tests

---

### P1 (High)

**Criteria:** Important features + Medium risk (3-4) + Common workflows + Workaround exists but difficult

| Test ID    | Requirement               | Test Level  | Risk Link | Notes                        |
| ---------- | ------------------------- | ----------- | --------- | ---------------------------- |
| **P1-001** | Photo attachment upload   | Integration | R-002     | Supabase storage integration |
| **P1-002** | Multi-meter batch reading | System      | R-013     | Efficiency, data consistency |
| **P1-003** | Invoice PDF generation    | Integration | R-009     | Template rendering, accuracy |
| **P1-004** | User role management      | Unit        | R-017     | Admin vs reader permissions  |
| **P1-005** | Offline queue processing  | System      | R-001     | Background sync when online  |
| **P1-006** | Error boundary handling   | System      | R-015     | Graceful degradation         |
| **P1-007** | Log level configuration   | Integration | R-014     | Dynamic log toggling         |
| **P1-008** | Synthetic data generation | Unit        | R-013     | Faker-based test data        |

**Total P1:** ~8 tests

---

### P2 (Medium)

**Criteria:** Secondary features + Low risk (1-2) + Edge cases + Regression prevention

| Test ID    | Requirement                 | Test Level  | Risk Link | Notes                              |
| ---------- | --------------------------- | ----------- | --------- | ---------------------------------- |
| **P2-001** | Network error recovery      | System      | R-016     | Retry logic, offline fallback      |
| **P2-002** | Input validation (XSS/SQLi) | Unit        | R-017     | Sanitization, injection prevention |
| **P2-003** | Correlation ID tracing      | Integration | R-018     | Request tracing across services    |
| **P2-004** | Deployment rollback         | System      | R-016     | Automated rollback on failure      |

**Total P2:** ~4 tests

---

### P3 (Low)

**Criteria:** Nice-to-have + Exploratory + Performance benchmarks + Documentation validation

| Test ID    | Requirement         | Test Level | Notes                                  |
| ---------- | ------------------- | ---------- | -------------------------------------- |
| **P3-001** | Exploratory testing | Manual     | User experience validation, edge cases |

**Total P3:** ~1 tests

---

## Execution Strategy

**Philosophy:** Run everything in PRs unless there's significant infrastructure overhead. Playwright with parallelization is extremely fast (100s of tests in ~10-15 min).

**Organized by TOOL TYPE:**

### Every PR: Playwright Tests (~10-15 min)

**All functional tests** (from any priority level):

- All E2E, API, integration, unit tests using Playwright
- Parallelized across 4 shards
- Total: ~25 Playwright tests (includes P0, P1, P2, P3)

**Why run in PRs:** Fast feedback, no expensive infrastructure

### Nightly: k6 Performance Tests (~30-60 min)

**All performance tests** (from any priority level):

- Load, stress, spike tests for API endpoints
- Total: ~5 k6 tests (P0 latency, P1 scalability)

**Why defer to nightly:** Expensive infrastructure (k6 Cloud), long-running (10-40 min per test)

### Weekly: Chaos & Long-Running (~hours)

**Special infrastructure tests** (from any priority level):

- Multi-region failover (Railway redundancy)
- Disaster recovery (PostgreSQL backup restore, 4+ hours)
- Endurance tests (continuous sync, 4+ hours)

**Why defer to weekly:** Very expensive infrastructure, very long-running, infrequent validation sufficient

**Manual tests** (excluded from automation):

- DevOps validation (Railway deployment, monitoring)
- Finance validation (cost alerts)
- Documentation validation

---

## QA Effort Estimate

**QA test development effort only** (excludes DevOps, Backend, Data Eng, Finance work):

| Priority  | Count | Effort Range   | Notes                                                          |
| --------- | ----- | -------------- | -------------------------------------------------------------- |
| P0        | ~12   | ~2-3 weeks     | Complex setup (security, performance, multi-step offline sync) |
| P1        | ~8    | ~1-2 weeks     | Standard coverage (integration, API tests)                     |
| P2        | ~4    | ~3-5 days      | Edge cases, simple validation                                  |
| P3        | ~1    | ~1-2 days      | Exploratory, benchmarks                                        |
| **Total** | ~25   | **~4-5 weeks** | **1 QA engineer, full-time**                                   |

**Assumptions:**

- Includes test design, implementation, debugging, CI integration
- Excludes ongoing maintenance (~10% effort)
- Assumes test infrastructure (factories, fixtures) ready

**Dependencies from other teams:**

- See "Dependencies & Test Blockers" section for what QA needs from Backend, DevOps, Data Eng

---

## Appendix A: Code Examples & Tagging

**Playwright Tags for Selective Execution:**

```typescript
import { test } from "@playwright/test";
import { expect } from "@playwright/test";

// P0 critical test
test("@P0 @API @Security unauthenticated request returns 401", async ({
  apiRequest,
}) => {
  const { status, body } = await apiRequest({
    method: "POST",
    path: "/api/meter-reading",
    body: { data: "test" },
    skipAuth: true,
  });

  expect(status).toBe(401);
  expect(body.error).toContain("unauthorized");
});

// P1 integration test
test("@P1 @Integration data syncs correctly", async ({ apiRequest }) => {
  // Seed data
  await apiRequest({
    method: "POST",
    path: "/api/test-data",
    body: { meter: { id: "test-123", reading: 1500 } },
  });

  // Validate sync
  const { status, body } = await apiRequest({
    method: "GET",
    path: "/api/meter/test-123",
  });

  expect(status).toBe(200);
  expect(body.reading).toBe(1500);
});
```

**Run specific tags:**

```bash
# Run only P0 tests
npx playwright test --grep @P0

# Run P0 + P1 tests
npx playwright test --grep "@P0|@P1"

# Run only security tests
npx playwright test --grep @Security

# Run all Playwright tests in PR (default)
npx playwright test
```

---

## Appendix B: Knowledge Base References

- **Risk Governance**: `risk-governance.md` - Risk scoring methodology
- **Test Priorities Matrix**: `test-priorities-matrix.md` - P0-P3 criteria
- **Test Levels Framework**: `test-levels-framework.md` - E2E vs API vs Unit selection
- **Test Quality**: `test-quality.md` - Definition of Done (no hard waits, <300 lines, <1.5 min)

---

**Generated by:** BMad TEA Agent
**Workflow:** `_bmad/bmm/testarch/test-design`
**Version:** 4.0 (BMad v6)
