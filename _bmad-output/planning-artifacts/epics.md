---
stepsCompleted:
  [
    "step-01-validate-prerequisites",
    "step-02-design-epics",
    "step-03-create-stories",
    "step-04-final-validation",
  ]
inputDocuments: ["prd.md", "architecture.md", "ux-design-specification.md"]
---

# WaterHouse - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for WaterHouse, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

#### Application Mobile (Android)

##### Authentification et Sécurité

- **REQ-AUTH-001**: Authentification par numéro de téléphone + OTP SMS
- **REQ-AUTH-002**: Support du code PIN ou biométrie pour accès rapide
- **REQ-AUTH-003**: Déconnexion automatique après 30 minutes d'inactivité
- **REQ-AUTH-004**: Chiffrement des données sensibles (photos, données personnelles)

##### Gestion des Données de Base

- **REQ-DATA-001**: Synchronisation des immeubles, logements et compteurs assignés
- **REQ-DATA-002**: Stockage local pour mode hors-ligne complet
- **REQ-DATA-003**: Mise à jour automatique des données de référence

##### Saisie des Relevés

- **REQ-INPUT-001**: Liste des compteurs triée par immeuble/étage/priorité
- **REQ-INPUT-002**: Affichage de l'index précédent pour chaque compteur
- **REQ-INPUT-003**: Capture photo obligatoire avant saisie index
- **REQ-INPUT-004**: Clavier numérique optimisé pour saisie rapide
- **REQ-INPUT-005**: Validation en temps réel de la cohérence des index
- **REQ-INPUT-006**: Alerte bloquante si index actuel < index précédent
- **REQ-INPUT-007**: Option de forcer la saisie avec commentaire obligatoire
- **REQ-INPUT-008**: Horodatage automatique de chaque relevé

##### Mode Hors-Ligne

- **REQ-OFFLINE-001**: Fonctionnement complet sans connexion réseau
- **REQ-OFFLINE-002**: Stockage local des relevés et photos
- **REQ-OFFLINE-003**: Synchronisation automatique à la reconnexion
- **REQ-OFFLINE-004**: Indicateur visuel du statut de synchronisation
- **REQ-OFFLINE-005**: Résolution des conflits de synchronisation

#### Backend et Calculs

##### Gestion des Données

- **REQ-BACK-001**: Stockage sécurisé des relevés avec métadonnées (releveur, timestamp, photo)
- **REQ-BACK-002**: Historique complet des index par compteur
- **REQ-BACK-003**: Gestion des immeubles, logements, locataires et compteurs

##### Calcul des Factures

- **REQ-CALC-001**: Formule configurable : (Index_actuel - Index_précédent) × Tarif + Taxes
- **REQ-CALC-002**: Support des tarifs progressifs (tranches)
- **REQ-CALC-003**: Calcul automatique des taxes et frais fixes
- **REQ-CALC-004**: Validation des calculs avant génération facture

##### Génération et Envoi

- **REQ-GEN-001**: Génération PDF facture avec template professionnel
- **REQ-GEN-002**: Inclusion obligatoire : période, index préc./actuel, consommation, montant TTC
- **REQ-GEN-003**: Hébergement sécurisé des PDF avec liens temporaires
- **REQ-GEN-004**: Envoi prioritaire par SMS avec lien PDF
- **REQ-GEN-005**: Envoi complémentaire par email si disponible
- **REQ-GEN-006**: Logs détaillés des envois (succès/échec, timestamp)

#### Interface Web Gestionnaire

##### Configuration

- **REQ-WEB-001**: Interface d'administration des immeubles et logements
- **REQ-WEB-002**: Gestion des compteurs (numéro, localisation, index initial)
- **REQ-WEB-003**: Configuration des tarifs et formules de calcul
- **REQ-WEB-004**: Import/export des données locataires

##### Validation et Génération

- **REQ-WEB-005**: Dashboard des relevés en attente de validation
- **REQ-WEB-006**: Visualisation des photos de relevé
- **REQ-WEB-007**: Validation groupée ou individuelle des relevés
- **REQ-WEB-008**: Lancement de génération/envoi groupé des factures

##### Suivi et Reporting

- **REQ-WEB-009**: Historique des factures envoyées avec statuts
- **REQ-WEB-010**: Indicateurs de succès d'envoi (SMS/email)
- **REQ-WEB-011**: Export des données au format CSV/Excel

### NonFunctional Requirements

#### Performance

- **REQ-PERF-001**: Temps de démarrage application < 3 secondes
- **REQ-PERF-002**: Saisie d'un relevé complet < 30 secondes
- **REQ-PERF-003**: Synchronisation des données < 10 secondes par Mo
- **REQ-PERF-004**: Génération facture < 5 secondes
- **REQ-PERF-005**: Envoi SMS réussi > 98% des cas

#### Sécurité

- **REQ-SEC-001**: Chiffrement AES-256 des données sensibles
- **REQ-SEC-002**: Authentification à deux facteurs obligatoire
- **REQ-SEC-003**: Accès basé sur les rôles (releveur, gestionnaire)
- **REQ-SEC-004**: Audit logs de toutes les opérations sensibles
- **REQ-SEC-005**: Conformité RGPD pour les données personnelles

#### Fiabilité

- **REQ-REL-001**: Disponibilité backend > 99.5%
- **REQ-REL-002**: Mode hors-ligne fonctionnel 100% du temps
- **REQ-REL-003**: Récupération automatique des pannes < 1 heure
- **REQ-REL-004**: Sauvegarde automatique des données toutes les 6 heures

#### Utilisabilité

- **REQ-USAB-001**: Interface adaptée aux écrans 5-6 pouces
- **REQ-USAB-002**: Support des langues française et anglaise
- **REQ-USAB-003**: Accessibilité pour utilisateurs malvoyants (contraste, taille texte)
- **REQ-USAB-004**: Formation utilisateur < 10 minutes

#### Compatibilité

- **REQ-COMP-001**: Android 8.0+ (couverture > 90% marché africain)
- **REQ-COMP-002**: Navigateurs web modernes (Chrome, Firefox, Safari)
- **REQ-COMP-003**: Réseaux 2G/3G/4G avec optimisation faible bande passante

### Additional Requirements

#### From Architecture Document

- **ARCH-OFFLINE-001**: Sync mechanism for offline data reconciliation with conflict resolution
- **ARCH-API-001**: RESTful API design with JSON responses and standard HTTP status codes
- **ARCH-DATA-001**: PostgreSQL relational schema with TypeORM for data access
- **ARCH-SECURITY-001**: JWT authentication with role-based access control
- **ARCH-PERF-001**: Connection pooling and query optimization for high concurrency
- **ARCH-DEPLOY-001**: Railway hosting with automatic scaling and backup
- **ARCH-STORAGE-001**: Supabase for photo/PDF storage with secure access
- **ARCH-INTEGRATION-001**: Africa's Talking API integration with fallback handling
- **ARCH-MOBILE-001**: React Native with Redux Toolkit for state management
- **ARCH-BUILD-001**: Nx monorepo for unified development and CI/CD

### FR Coverage Map

| Requirement ID  | Epic   | Description                                                                    |
| --------------- | ------ | ------------------------------------------------------------------------------ |
| REQ-AUTH-001    | Epic 1 | Authentification par numéro de téléphone + OTP SMS                             |
| REQ-AUTH-002    | Epic 1 | Support du code PIN ou biométrie pour accès rapide                             |
| REQ-AUTH-003    | Epic 1 | Déconnexion automatique après 30 minutes d'inactivité                          |
| REQ-AUTH-004    | Epic 1 | Chiffrement des données sensibles (photos, données personnelles)               |
| REQ-DATA-001    | Epic 2 | Synchronisation des immeubles, logements et compteurs assignés                 |
| REQ-DATA-002    | Epic 2 | Stockage local pour mode hors-ligne complet                                    |
| REQ-DATA-003    | Epic 2 | Mise à jour automatique des données de référence                               |
| REQ-INPUT-001   | Epic 3 | Liste des compteurs triée par immeuble/étage/priorité                          |
| REQ-INPUT-002   | Epic 3 | Affichage de l'index précédent pour chaque compteur                            |
| REQ-INPUT-003   | Epic 3 | Capture photo obligatoire avant saisie index                                   |
| REQ-INPUT-004   | Epic 3 | Clavier numérique optimisé pour saisie rapide                                  |
| REQ-INPUT-005   | Epic 3 | Validation en temps réel de la cohérence des index                             |
| REQ-INPUT-006   | Epic 3 | Alerte bloquante si index actuel < index précédent                             |
| REQ-INPUT-007   | Epic 3 | Option de forcer la saisie avec commentaire obligatoire                        |
| REQ-INPUT-008   | Epic 3 | Horodatage automatique de chaque relevé                                        |
| REQ-OFFLINE-001 | Epic 3 | Fonctionnement complet sans connexion réseau                                   |
| REQ-OFFLINE-002 | Epic 3 | Stockage local des relevés et photos                                           |
| REQ-OFFLINE-004 | Epic 3 | Indicateur visuel du statut de synchronisation                                 |
| REQ-OFFLINE-003 | Epic 4 | Synchronisation automatique à la reconnexion                                   |
| REQ-OFFLINE-005 | Epic 4 | Résolution des conflits de synchronisation                                     |
| REQ-BACK-001    | Epic 4 | Stockage sécurisé des relevés avec métadonnées (releveur, timestamp, photo)    |
| REQ-BACK-002    | Epic 4 | Historique complet des index par compteur                                      |
| REQ-BACK-003    | Epic 2 | Gestion des immeubles, logements, locataires et compteurs                      |
| REQ-CALC-001    | Epic 5 | Formule configurable : (Index_actuel - Index_précédent) × Tarif + Taxes        |
| REQ-CALC-002    | Epic 5 | Support des tarifs progressifs (tranches)                                      |
| REQ-CALC-003    | Epic 5 | Calcul automatique des taxes et frais fixes                                    |
| REQ-CALC-004    | Epic 5 | Validation des calculs avant génération facture                                |
| REQ-GEN-001     | Epic 5 | Génération PDF facture avec template professionnel                             |
| REQ-GEN-002     | Epic 5 | Inclusion obligatoire : période, index préc./actuel, consommation, montant TTC |
| REQ-GEN-003     | Epic 5 | Hébergement sécurisé des PDF avec liens temporaires                            |
| REQ-GEN-004     | Epic 6 | Envoi prioritaire par SMS avec lien PDF                                        |
| REQ-GEN-005     | Epic 6 | Envoi complémentaire par email si disponible                                   |
| REQ-GEN-006     | Epic 6 | Logs détaillés des envois (succès/échec, timestamp)                            |
| REQ-WEB-001     | Epic 2 | Interface d'administration des immeubles et logements                          |
| REQ-WEB-002     | Epic 2 | Gestion des compteurs (numéro, localisation, index initial)                    |
| REQ-WEB-003     | Epic 5 | Configuration des tarifs et formules de calcul                                 |
| REQ-WEB-004     | Epic 2 | Import/export des données locataires                                           |
| REQ-WEB-005     | Epic 7 | Dashboard des relevés en attente de validation                                 |
| REQ-WEB-006     | Epic 7 | Visualisation des photos de relevé                                             |
| REQ-WEB-007     | Epic 7 | Validation groupée ou individuelle des relevés                                 |
| REQ-WEB-008     | Epic 6 | Lancement de génération/envoi groupé des factures                              |
| REQ-WEB-009     | Epic 7 | Historique des factures envoyées avec statuts                                  |
| REQ-WEB-010     | Epic 7 | Indicateurs de succès d'envoi (SMS/email)                                      |
| REQ-WEB-011     | Epic 7 | Export des données au format CSV/Excel                                         |

## Epic List

1. Epic 1: Authentification et Accès Sécurisé
2. Epic 2: Gestion des Données de Base
3. Epic 3: Saisie des Relevés Hors-Ligne
4. Epic 4: Synchronisation et Résolution de Conflits
5. Epic 5: Calcul et Génération des Factures
6. Epic 6: Envoi et Communication
7. Epic 7: Interface Web de Gestion

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 1: Authentification et Accès Sécurisé

Permettre aux utilisateurs de s'authentifier de manière sécurisée et d'accéder à l'application avec différents niveaux d'autorisation.

### Story 1.1: Authentification par SMS OTP

As a releveur,
I want to authenticate with my phone number and receive an OTP SMS,
So that I can securely access the mobile application.

**Acceptance Criteria:**

**Given** I have a valid phone number
**When** I enter my phone number and request authentication
**Then** I receive an OTP SMS and can enter it to login
**And** Invalid OTP is rejected with clear error message

### Story 1.2: Accès rapide par PIN/Biometrie

As a releveur,
I want to use PIN or biometric authentication for quick access,
So that I don't need to enter OTP every time I open the app.

**Acceptance Criteria:**

**Given** I am authenticated with OTP
**When** I enable PIN or biometric authentication
**Then** I can login using PIN/biometric instead of OTP
**And** Authentication fails if PIN/biometric is incorrect

### Story 1.3: Déconnexion automatique

As a system administrator,
I want users to be automatically logged out after 30 minutes of inactivity,
So that security is maintained and unauthorized access is prevented.

**Acceptance Criteria:**

**Given** User is logged in
**When** 30 minutes pass without activity
**Then** User is automatically logged out
**And** Next access requires re-authentication

### Story 1.4: Chiffrement des données sensibles

As a developer,
I want sensitive data (photos, personal info) to be encrypted,
So that data privacy is protected even if device is compromised.

**Acceptance Criteria:**

**Given** Sensitive data is stored
**When** Data is at rest on device
**Then** Data is encrypted with AES-256
**And** Decryption requires valid authentication

## Epic 2: Gestion des Données de Base

Fournir la base de données des immeubles, logements et compteurs avec synchronisation et administration web.

### Story 2.1: Synchronisation des données de base

As a releveur,
I want my assigned buildings, apartments and meters to be synchronized,
So that I can work with the latest data even offline.

**Acceptance Criteria:**

**Given** I have internet connection
**When** I open the app
**Then** Latest building/apartment/meter data is downloaded
**And** Data is stored locally for offline access

### Story 2.2: Stockage local des données

As a releveur,
I want all reference data stored locally,
So that I can work completely offline.

**Acceptance Criteria:**

**Given** Data is synchronized
**When** I lose internet connection
**Then** All reference data remains accessible
**And** App functions normally without network

### Story 2.3: Interface d'administration web

As a gestionnaire,
I want to administer buildings and apartments through a web interface,
So that I can manage the property data centrally.

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I access the web interface
**Then** I can create/edit/delete buildings and apartments
**And** Changes are synchronized to mobile apps

### Story 2.4: Gestion des compteurs

As a gestionnaire,
I want to manage meters through the web interface,
So that I can add new meters and set initial readings.

**Acceptance Criteria:**

**Given** I am logged in as admin
**When** I access meter management
**Then** I can add/edit meters with location and initial reading
**And** Meter data is synchronized to assigned releveurs

### Story 2.5: Import/Export des données

As a gestionnaire,
I want to import/export tenant data,
So that I can bulk manage tenant information.

**Acceptance Criteria:**

**Given** I have a CSV file
**When** I upload it
**Then** Tenant data is imported with validation
**And** I can export current tenant data to CSV

## Epic 3: Saisie des Relevés Hors-Ligne

Permettre aux releveurs de saisir les index des compteurs avec photos, validation et stockage local hors-ligne.

### Story 3.1: Liste des compteurs triée

As a releveur,
I want to see my assigned meters sorted by building/floor/priority,
So that I can efficiently plan my reading route.

**Acceptance Criteria:**

**Given** I have assigned meters
**When** I view the meter list
**Then** Meters are sorted by building, then floor, then priority
**And** I can see previous reading for each meter

### Story 3.2: Capture photo obligatoire

As a releveur,
I want to be required to take a photo before entering the reading,
So that readings are verified with visual evidence.

**Acceptance Criteria:**

**Given** I select a meter
**When** I try to enter reading
**Then** Camera opens automatically for photo capture
**And** Cannot proceed without photo

### Story 3.3: Validation en temps réel

As a releveur,
I want real-time validation of readings,
So that I catch errors immediately.

**Acceptance Criteria:**

**Given** I enter a reading
**When** Reading is lower than previous
**Then** Warning shown but can proceed with comment
**And** Invalid formats are rejected

### Story 3.4: Stockage local hors-ligne

As a releveur,
I want readings and photos stored locally when offline,
So that I can continue working without network.

**Acceptance Criteria:**

**Given** I am offline
**When** I complete a reading
**Then** Data is stored locally
**And** Sync status indicator shows "pending"

### Story 3.5: Indicateur de statut de synchronisation

As a releveur,
I want to see the sync status of my readings,
So that I know what data needs to be synchronized.

**Acceptance Criteria:**

**Given** I have readings
**When** I view the list
**Then** Each reading shows sync status (synced/pending/failed)
**And** Pending readings are highlighted

## Epic 4: Synchronisation et Résolution de Conflits

Synchroniser automatiquement les données locales avec le backend et résoudre les conflits de manière intelligente.

### Story 4.1: Synchronisation automatique en ligne

As a releveur,
I want automatic sync when online,
So that my data is always backed up.

**Acceptance Criteria:**

**Given** I'm online with pending readings
**When** I open the app
**Then** sync starts automatically
**And** I see sync progress
**And** sync completes without blocking UI

### Story 4.2: Résolution manuelle des conflits

As a releveur,
I want to resolve sync conflicts manually,
So that I can choose which data to keep.

**Acceptance Criteria:**

**Given** a sync conflict (same meter read twice)
**When** I review conflicts
**Then** I see both versions with timestamps
**And** I can choose which to keep
**And** the chosen version is saved

### Story 4.3: Retry des synchronisations échouées

As a releveur,
I want to retry failed syncs,
So that I can recover from network issues.

**Acceptance Criteria:**

**Given** a failed sync
**When** I tap retry
**Then** sync attempts again
**And** if successful, data is synced
**And** status updates to synced

### Story 4.4: Affichage du statut de synchronisation

As a releveur,
I want to view sync status for each reading,
So that I know what's pending.

**Acceptance Criteria:**

**Given** I have readings with different sync states
**When** I view the list
**Then** each reading shows sync status (synced/pending/failed)
**And** pending readings are highlighted

## Epic 5: Calcul et Génération des Factures

Calculer automatiquement les consommations et générer des factures PDF professionnelles avec les tarifs configurables.

### Story 5.1: Configuration des tarifs de facturation

As a gestionnaire,
I want to configure billing rates,
So that I can set different tariffs per meter type.

**Acceptance Criteria:**

**Given** I have admin access
**When** I configure rates
**Then** I can set rates per cubic meter
**And** rates are saved and versioned

### Story 5.2: Calcul automatique de la consommation

As a system,
I want to calculate consumption automatically,
So that bills are accurate.

**Acceptance Criteria:**

**Given** previous and current readings
**When** calculating bill
**Then** consumption = current - previous
**And** handles negative readings (errors)

### Story 5.3: Génération de factures PDF

As a gestionnaire,
I want to generate PDF invoices,
So that customers receive professional bills.

**Acceptance Criteria:**

**Given** a calculated bill
**When** generating PDF
**Then** PDF includes all details (consumption, amount, dates)
**And** is properly formatted
**And** downloadable

### Story 5.4: Historique des factures

As a gestionnaire,
I want to view bill history,
So that I can track payments and issues.

**Acceptance Criteria:**

**Given** generated bills
**When** viewing history
**Then** I see all bills with status
**And** can filter by period/customer

## Epic 6: Envoi et Communication

Envoyer les factures par SMS et email avec suivi des statuts d'envoi et logs détaillés.

### Story 6.1: Envoi de factures par SMS

As a gestionnaire,
I want to send invoices by SMS,
So that customers receive notifications.

**Acceptance Criteria:**

**Given** a generated invoice
**When** sending by SMS
**Then** SMS is sent via Africa's Talking
**And** delivery status is tracked

### Story 6.2: Envoi de factures par email

As a gestionnaire,
I want to send invoices by email,
So that customers receive PDF attachments.

**Acceptance Criteria:**

**Given** a generated invoice
**When** sending by email
**Then** email with PDF attachment is sent
**And** delivery status is tracked

### Story 6.3: Logs de communication

As a gestionnaire,
I want to view communication logs,
So that I can track delivery status.

**Acceptance Criteria:**

**Given** sent communications
**When** viewing logs
**Then** I see all SMS/email with status
**And** timestamps and error messages

### Story 6.4: Gestion des échecs d'envoi SMS

As a system,
I want to handle SMS delivery failures,
So that I can retry or notify admin.

**Acceptance Criteria:**

**Given** SMS delivery failure
**When** retrying
**Then** attempts up to 3 times
**And** notifies admin if all fail

## Epic 7: Interface Web de Gestion

Fournir une interface web complète pour la validation des relevés, visualisation des photos et reporting.

### Story 7.1: Validation des relevés

As a gestionnaire,
I want to validate meter readings,
So that I can approve or reject readings.

**Acceptance Criteria:**

**Given** pending readings
**When** reviewing
**Then** I can view photos and data
**And** approve or reject with comments

### Story 7.2: Visualisation des photos de relevés

As a gestionnaire,
I want to view reading photos,
So that I can verify meter accuracy.

**Acceptance Criteria:**

**Given** readings with photos
**When** viewing
**Then** photos are displayed clearly
**And** I can zoom and rotate

### Story 7.3: Génération de rapports

As a gestionnaire,
I want to generate reports,
So that I can analyze performance.

**Acceptance Criteria:**

**Given** reading data
**When** generating reports
**Then** I can filter by date/area
**And** export to CSV/PDF

### Story 7.4: Gestion des utilisateurs

As a gestionnaire,
I want to manage users,
So that I can add/remove releveurs.

**Acceptance Criteria:**

**Given** admin access
**When** managing users
**Then** I can add/edit/delete users
**And** assign areas/permissions

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

<!-- End story repeat -->
