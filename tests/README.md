# Tests

This folder contains the test architecture scaffolded by the BMAD Test Architect workflow.

Setup:

1. Copy `.env.example` to `.env` and update `BASE_URL` and `API_URL`.
2. Install dev dependencies (example):

```bash
npm install -D @playwright/test faker
npx playwright install
```

Running tests:

```bash
npm run test:e2e
```

Layout:

- `tests/e2e/` — end-to-end specs
- `tests/support/fixtures/` — fixture implementations and factories
- `tests/support/helpers/` — helper utilities

Best practices:

- Use `data-testid` selectors for stable tests.
- Keep fixtures isolated and perform cleanup after test run.
- Prefer API-level tests for core logic; use E2E selectively for user flows.
