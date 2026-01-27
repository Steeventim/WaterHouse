---
story_id: "2.4"
story_key: "2-4-gestion-des-compteurs"
epic: "Epic 2: Gestion des Données de Base"
title: "Gestion des compteurs"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 2.4: Gestion des compteurs

## User Story

**As a** gestionnaire (building manager),
**I want to** manage meters (create, update, deactivate),
**So that** I can maintain accurate meter inventory.

## Acceptance Criteria

**Given** I have access to the web interface
**When** I manage meters
**Then** I can add new meters, update existing ones, and deactivate old ones
**And** All changes are reflected in mobile applications

## Technical Requirements

### Functional Requirements
- **REQ-WEB-002**: Gestion des compteurs (numéro, localisation, index initial)
- **REQ-DATA-003**: Mise à jour automatique des données de référence

### Implementation Notes
- CRUD operations for meters via web interface
- Meter assignment to apartments
- Initial reading configuration
- Meter deactivation/reactivation
- Serial number uniqueness validation
- Bulk meter operations support