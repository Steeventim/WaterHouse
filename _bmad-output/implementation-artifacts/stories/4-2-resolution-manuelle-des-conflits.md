---
story_id: "4.2"
story_key: "4-2-resolution-manuelle-des-conflits"
epic: "Epic 4: Synchronisation et Résolution de Conflits"
title: "Résolution manuelle des conflits"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 4.2: Résolution manuelle des conflits

## User Story

**As a** releveur (meter reader),
**I want to** manually resolve synchronization conflicts,
**So that** I can choose which reading version to keep.

## Acceptance Criteria

**Given** A sync conflict is detected
**When** I review the conflict
**Then** I can see both versions with timestamps
**And** Choose which version to keep or merge data

## Technical Requirements

### Functional Requirements
- **REQ-OFFLINE-005**: Résolution des conflits de synchronisation

### Implementation Notes
- Conflict detection during sync
- Side-by-side comparison UI
- Version selection and merging
- Conflict resolution audit trail