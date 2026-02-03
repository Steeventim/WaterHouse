---
story_id: '5.3'
story_key: '5-3-generation-de-factures-pdf'
epic: 'Epic 5: Calcul et Génération des Factures'
title: 'Génération de factures PDF'
status: 'ready-for-dev'
assignee: ''
created: '2026-01-27'
updated: '2026-01-27'
---

# Story 5.3: Génération de factures PDF

## User Story

**As a** system,
**I want to** generate professional PDF invoices,
**So that** tenants receive clear and official billing documents.

## Acceptance Criteria

**Given** Consumption calculations are complete
**When** Invoices are generated
**Then** PDFs include all required elements (period, readings, amount)
**And** Documents are stored securely with temporary access links

## Technical Requirements

### Functional Requirements

- **REQ-GEN-001**: Génération PDF facture avec template professionnel
- **REQ-GEN-003**: Hébergement sécurisé des PDF avec liens temporaires

### Implementation Notes

- PDF generation with templates
- Secure storage and access
- Template customization
- Bulk PDF generation

## Tasks/Subtasks

- [x] Define PDF template and required fields
  - [x] Map invoice data model to template fields (period, readings, amounts)
  - [x] Create template layout and styling for professional invoice
- [x] Implement PDF generation service
  - [x] Add service to render invoice data to PDF
  - [x] Support single and bulk generation
- [x] Implement secure storage and temporary access links
  - [x] Store generated PDFs securely (local or object storage)
  - [x] Generate time-limited access links
  - [x] Enforce link expiration
- [x] Integrate invoice generation flow
  - [x] Trigger PDF generation after consumption calculations complete
  - [x] Persist PDF metadata in invoice records
- [x] Add tests
  - [x] Unit tests for PDF generation service
  - [x] Integration tests for storage + link lifecycle
- [x] Update documentation
  - [x] Document PDF generation workflow and access links

## Dev Agent Record

### Implementation Plan
- Build invoice template service with required fields and styling.
- Add storage service to persist PDFs and issue time-limited links.
- Orchestrate generation workflow and persist metadata in memory.
- Add unit/integration tests for template, storage, and generation.
- Update README with PDF generation notes.

### Debug Log
- Tests executed (per user request):
  - `npx jest --config apps/mobile/jest.config.cts --runTestsByPath apps/mobile/src/features/billing/services/__tests__/InvoicePdfService.spec.ts apps/mobile/src/features/billing/services/__tests__/InvoicePdfStorageService.spec.ts apps/mobile/src/features/billing/services/__tests__/InvoiceGenerationService.spec.ts`
- Note: Full mobile test suite not run; existing failures are pre-existing in repo.

### Completion Notes
- Implemented invoice PDF template builder and orchestration services.
- Added secure local storage with expiring access links.
- Added unit/integration tests for template, storage, and generation.
- Updated README with PDF generation flow notes.

## File List
- apps/mobile/src/features/billing/services/InvoicePdfService.ts
- apps/mobile/src/features/billing/services/InvoicePdfStorageService.ts
- apps/mobile/src/features/billing/services/InvoiceGenerationService.ts
- apps/mobile/src/features/billing/services/__tests__/InvoicePdfService.spec.ts
- apps/mobile/src/features/billing/services/__tests__/InvoicePdfStorageService.spec.ts
- apps/mobile/src/features/billing/services/__tests__/InvoiceGenerationService.spec.ts
- apps/mobile/jest.config.cts
- apps/mobile/tsconfig.spec.json
- apps/mobile/project.json
- README.md

## Change Log
- 2026-02-03: Added invoice PDF template, storage with expiring links, generation orchestration, and tests.

## Status
- review
