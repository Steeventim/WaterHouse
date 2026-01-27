---
story_id: "5.2"
story_key: "5-2-calcul-automatique-de-la-consommation"
epic: "Epic 5: Calcul et Génération des Factures"
title: "Calcul automatique de la consommation"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 5.2: Calcul automatique de la consommation

## User Story

**As a** system,
**I want to** automatically calculate consumption from meter readings,
**So that** accurate billing amounts are computed.

## Acceptance Criteria

**Given** New meter readings are available
**When** Billing period ends
**Then** Consumption is calculated using (current - previous) × rate
**And** Progressive pricing is applied if configured

## Technical Requirements

### Functional Requirements
- **REQ-CALC-002**: Support des tarifs progressifs (tranches)
- **REQ-CALC-003**: Calcul automatique des taxes et frais fixes

### Implementation Notes
- Consumption calculation engine
- Progressive rate application
- Tax and fee computation
- Calculation validation and audit