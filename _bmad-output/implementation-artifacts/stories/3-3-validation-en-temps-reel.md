---
story_id: "3.3"
story_key: "3-3-validation-en-temps-reel"
epic: "Epic 3: Saisie des Relevés Hors-Ligne"
title: "Validation en temps réel"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 3.3: Validation en temps réel

## User Story

**As a** releveur (meter reader),
**I want to** receive immediate feedback on meter reading validity,
**So that** I can correct errors before submitting.

## Acceptance Criteria

**Given** I am entering a meter reading
**When** I enter a value lower than previous reading
**Then** System shows warning but allows override with comment
**And** Invalid formats are rejected immediately

## Technical Requirements

### Functional Requirements
- **REQ-INPUT-005**: Validation en temps réel de la cohérence des index
- **REQ-INPUT-006**: Alerte bloquante si index actuel < index précédent
- **REQ-INPUT-007**: Option de forcer la saisie avec commentaire obligatoire

### Implementation Notes
- Real-time input validation
- Contextual warnings and errors
- Override mechanisms with audit trail
- Input format validation (numeric, decimal places)