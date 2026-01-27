---
story_id: "5.1"
story_key: "5-1-configuration-des-tarifs-de-facturation"
epic: "Epic 5: Calcul et Génération des Factures"
title: "Configuration des tarifs de facturation"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 5.1: Configuration des tarifs de facturation

## User Story

**As a** gestionnaire (building manager),
**I want to** configure billing rates and formulas,
**So that** invoices are calculated correctly for each property.

## Acceptance Criteria

**Given** I have access to billing configuration
**When** I set up rates for a building
**Then** I can define base rates, progressive pricing, and taxes
**And** Changes apply to future invoice calculations

## Technical Requirements

### Functional Requirements
- **REQ-WEB-003**: Configuration des tarifs et formules de calcul
- **REQ-CALC-001**: Formule configurable : (Index_actuel - Index_précédent) × Tarif + Taxes

### Implementation Notes
- Flexible tariff configuration
- Progressive pricing support
- Tax calculation setup
- Building-specific rate overrides