---
story_id: "3.4"
story_key: "3-4-stockage-local-hors-ligne"
epic: "Epic 3: Saisie des Relevés Hors-Ligne"
title: "Stockage local hors-ligne"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 3.4: Stockage local hors-ligne

## User Story

**As a** releveur (meter reader),
**I want to** store readings and photos locally when offline,
**So that** I can continue working without network connectivity.

## Acceptance Criteria

**Given** I am offline
**When** I complete meter readings with photos
**Then** All data is stored locally and encrypted
**And** Data syncs automatically when connection returns

## Technical Requirements

### Functional Requirements
- **REQ-OFFLINE-002**: Stockage local des relevés et photos
- **REQ-OFFLINE-003**: Synchronisation automatique à la reconnexion

### Implementation Notes
- Local SQLite storage for readings
- Encrypted photo storage
- Automatic sync queue management
- Conflict resolution for concurrent edits
- Storage quota monitoring