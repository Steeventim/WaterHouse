---
story_id: "3.2"
story_key: "3-2-capture-photo-obligatoire"
epic: "Epic 3: Saisie des Relevés Hors-Ligne"
title: "Capture photo obligatoire"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 3.2: Capture photo obligatoire

## User Story

**As a** releveur (meter reader),
**I want to** take a mandatory photo before entering meter reading,
**So that** readings are verified and tamper-proof.

## Acceptance Criteria

**Given** I am entering a meter reading
**When** I attempt to save without a photo
**Then** System prevents saving and shows error message
**And** Photo is stored securely with reading data

## Technical Requirements

### Functional Requirements
- **REQ-INPUT-003**: Capture photo obligatoire avant saisie index
- **REQ-SEC-001**: Chiffrement AES-256 des données sensibles

### Implementation Notes
- Camera integration with photo capture
- Photo validation and quality checks
- Encrypted photo storage
- Photo preview and retake capability
- Storage quota management