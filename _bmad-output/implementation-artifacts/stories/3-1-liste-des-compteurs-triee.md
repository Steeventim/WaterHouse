---
story_id: '3.1'
story_key: '3-1-liste-des-compteurs-triee'
epic: 'Epic 3: Saisie des Relevés Hors-Ligne'
title: 'Liste des compteurs triée'
status: 'review'
assignee: 'Dev Agent'
created: '2026-01-27'
updated: '2026-02-01'
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

---

## Dev Agent Record

### Implementation Date

**Date**: 2026-02-01

### Tasks Completed

- [x] Créer MeterSortingService pour tri hiérarchique des compteurs
- [x] Implémenter hook useMeters avec intégration LocalStorage
- [x] Créer MeterListScreen avec affichage groupé par immeuble
- [x] Ajouter composant ProgressBar avec indicateurs colorés
- [x] Implémenter filtres (statut, recherche)
- [x] Écrire tests unitaires pour MeterSortingService et ProgressBar

### File List

**Created Files:**

1. `apps/mobile/src/features/meters/services/MeterSortingService.ts` - Service de tri et organisation hiérarchique des compteurs
2. `apps/mobile/src/features/meters/hooks/useMeters.ts` - Hook React pour récupération et gestion des compteurs
3. `apps/mobile/src/features/meters/screens/MeterListScreen.tsx` - Écran principal de liste des compteurs
4. `apps/mobile/src/features/meters/components/ProgressBar.tsx` - Composant de barre de progression
5. `apps/mobile/src/features/meters/services/MeterSortingService.spec.ts` - Tests unitaires du service de tri
6. `apps/mobile/src/features/meters/components/ProgressBar.spec.tsx` - Tests du composant ProgressBar

### Technical Implementation Details

#### Architecture

- **MeterSortingService**: Classe statique pure avec méthodes de tri, filtrage et groupement
- **useMeters Hook**: Gestionnaire d'état avec intégration LocalStorage (SQLite)
- **MeterListScreen**: Liste avec groupement par immeuble (accordéon)
- **ProgressBar**: Composant visuel avec couleurs adaptatives (rouge < 30%, orange < 70%, vert ≥ 70%)

#### Key Features Implemented

1. **Tri hiérarchique**: Building name → Floor → Apartment number (locale-aware, numeric sorting)
2. **Enrichissement contextuel**: Meters + Apartments + Buildings joints en mémoire
3. **Groupement par immeuble**: Calcul automatique de progression (readMeters/totalMeters)
4. **Filtres multiples**:
   - Par immeuble
   - Par statut (tous/à faire/terminés)
   - Recherche full-text (building, address, apartment, serial number)
5. **Indicateurs visuels**:
   - Progression globale dans l'en-tête
   - Progression par immeuble (N/M compteurs + barre colorée)
   - Affichage du dernier index lu et date
6. **Gestion offline**: Données chargées depuis LocalStorage (SQLite)
7. **Pull-to-refresh**: Rechargement des données avec RefreshControl

#### Data Flow

```
LocalStorage (SQLite)
  ↓
useMeters Hook (load data)
  ↓
MeterSortingService.enrichMetersWithContext() → MeterWithContext[]
  ↓
MeterSortingService.sortMetersHierarchically() → sorted
  ↓
Apply filters (building, status, search)
  ↓
MeterSortingService.groupMetersByBuilding() → GroupedMeters[]
  ↓
MeterListScreen (render with accordions)
```

#### Testing Strategy

- **MeterSortingService**: 8 test suites couvrant tri, filtrage, recherche, groupement
- **ProgressBar**: Tests de rendu, validation des props, clamping 0-100
- **Coverage**: Toutes les méthodes publiques testées avec cas limites

### Change Log

**Story Status**: ready-for-dev → review

- Implémentation complète de la liste triée des compteurs
- Tests unitaires créés et passants
- Prêt pour code review

### Notes

- **TODO**: Intégrer avec table `readings` pour le statut réel des compteurs lus (actuellement basé sur `currentReading > initialReading`)
- **TODO**: Ajouter navigation vers écran de saisie de relevé au tap sur un compteur
- **TODO**: Implémenter swipe horizontal pour navigation rapide entre compteurs adjacents
- **TODO**: Ajouter persistance des filtres sélectionnés (AsyncStorage)
- **UX Design**: Conforme au design specification (feedback visuel, offline-first, célébration progression)
