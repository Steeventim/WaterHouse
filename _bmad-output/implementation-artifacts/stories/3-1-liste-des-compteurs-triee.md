---
story_id: "3.1"
story_key: "3-1-liste-des-compteurs-triee"
epic: "Epic 3: Saisie des Relevés Hors-Ligne"
title: "Liste des compteurs triée"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 3.1: Liste des compteurs triée

## User Story

**As a** releveur (meter reader),
**I want to** see meters sorted by building, floor, and priority,
**So that** I can efficiently navigate and read meters in optimal order.

## Acceptance Criteria

**Given** I have assigned buildings and apartments
**When** I view the meter list
**Then** Meters are sorted by building, then floor, then apartment number
**And** I can see progress indicators and completion status

## Technical Requirements

### Functional Requirements
- **REQ-INPUT-001**: Liste des compteurs triée par immeuble/étage/priorité
- **REQ-INPUT-002**: Affichage de l'index précédent pour chaque compteur

### Implementation Notes
- Hierarchical sorting (building → floor → apartment)
- Progress tracking and visual indicators
- Quick navigation between buildings/floors
- Offline functionality with local data