---
stepsCompleted:
  [
    "step-e-01-discovery",
    "step-e-01b-legacy-conversion",
    "step-e-02-review",
    "step-e-03-edit",
  ]
inputDocuments: []
workflowType: "prd"
---

# Product Requirements Document - WaterHouse

**Author:** [À définir - nom de l'utilisateur]  
**Date:** 26 January 2026

## Overview

### Executive Summary

WaterHouse is a revolutionary mobile solution designed to transform property management in French-speaking Africa by automating the water meter reading and billing process. The application eliminates inefficient manual processes by enabling secure readings with photographic evidence, automatic calculations compliant with local regulations, and instant invoice delivery via SMS and email. This solution brings significant time and cost savings, improves traceability, reduces disputes, and enhances the professional image of property managers.

### Product Objectives

- **Dramatically reduce time spent on readings and billing**: From several days to a few hours per month for managers
- **Eliminate manual errors**: Through automatic controls and visual evidence
- **Improve payment collection**: Via clear invoices and effective reminders
- **Strengthen trust**: Between managers, readers and tenants through transparency
- **Professionalize property management**: With modern tools adapted to the African context

### Project Scope

**Included in MVP:**

- Android mobile application for readers
- Basic web backend for managers
- Readings with mandatory photos
- Automatic invoice calculations
- Invoice sending via SMS with PDF link
- Complete offline mode
- Web interface for basic data management

**Out of Scope for MVP:**

- Mobile application for tenants
- Payment integration (mobile money)
- Automated payment reminders
- iOS version
- Advanced analytics
- Multi-manager complex management

## Success Metrics

### Key Quantitative Metrics

| Metric                   | MVP Target (3 months) | Mature Target (12 months) | Measurement Frequency |
| ------------------------ | --------------------- | ------------------------- | --------------------- |
| Reading adoption rate    | >70%                  | >90%                      | Monthly               |
| Average time per reading | <3 min                | <2 min                    | Per session           |
| SMS sending success rate | >98%                  | >99.5%                    | Daily                 |
| Dispute reduction        | ≥50%                  | ≥70%                      | Monthly               |
| Manager NPS              | >+30                  | >+50                      | Quarterly             |
| 15-day collection rate   | +15-25 pts            | +30-40 pts                | Monthly               |

### Qualitative Metrics

- User feedback via in-app surveys
- Key user interviews (5-10 per quarter)
- Usage log analysis for behavioral patterns
- Bug tracking and feature requests

### North Star Metric

**Monthly time saved + On-time collection rate**

This KPI combines operational efficiency (time = money) with direct financial impact (cashflow), capturing the essential business value of WaterHouse.

## Personas Utilisateurs

### Persona Primaire 1: Releveur Terrain (Gardien/Technicien)

**Profil Démographique :**

- Âge : 25-55 ans
- Niveau d'éducation : Secondaire complet, parfois technique
- Contexte professionnel : Gardien d'immeuble, technicien de maintenance
- Expérience technologique : Basique à intermédiaire, utilisation quotidienne de smartphones Android
- Revenu : Modeste, dépendant des commissions ou salaires fixes

**Comportements et Motivations :**

- Travaille sur le terrain, souvent dans des conditions difficiles (réseau instable, environnement urbain)
- Motive par la simplicité et la rapidité pour maximiser son temps
- Craint les erreurs qui peuvent mener à des disputes avec les locataires
- Valorise les outils qui le font paraître professionnel

**Douleurs Actuelles :**

- Relevés papier sujets à erreurs de lecture
- Absence de preuves visuelles menant à des contestations
- Temps perdu sur des tâches répétitives
- Difficultés avec les réseaux instables

**Objectifs et Désirs :**

- Saisie ultra-rapide (2-3 minutes par compteur)
- Protection contre les erreurs (alertes automatiques)
- Mode hors-ligne fiable
- Preuves photographiques pour éviter les litiges

**Citation Représentative :** "Avant, je passais 10 minutes par compteur et j'avais toujours peur des disputes. Maintenant, c'est 2 minutes avec photo, et c'est fini les problèmes !"

### Persona Primaire 2: Gestionnaire Immobilier

**Profil Démographique :**

- Âge : 35-65 ans
- Niveau d'éducation : Supérieur (gestion, commerce)
- Contexte professionnel : Propriétaire individuel ou gestionnaire d'immeubles (1-30 logements)
- Expérience technologique : Intermédiaire à avancée, utilisation régulière d'outils web
- Revenu : Moyen à élevé, dépendant des loyers

**Comportements et Motivations :**

- Gère plusieurs immeubles, souvent en parallèle avec d'autres activités
- Focus sur l'efficacité opérationnelle et la rentabilité
- Attache de l'importance à l'image professionnelle
- Utilise Excel et outils manuels actuellement

**Douleurs Actuelles :**

- Journées entières consacrées aux calculs et distributions de factures
- Erreurs de calcul menant à des pertes financières
- Relances manuelles chronophages des impayés
- Manque de traçabilité pour les audits

**Objectifs et Désirs :**

- Récupération de 80% du temps perdu sur les tâches administratives
- Traçabilité complète des opérations
- Réduction significative des litiges et impayés
- Outils professionnels pour renforcer son image

**Citation Représentative :** "Je passais 3-4 jours par mois sur la facturation. Maintenant, c'est 2-3 heures, et mes locataires paient plus vite !"

### Persona Secondaire 1: Locataire

**Profil Démographique :**

- Âge : 20-50 ans
- Niveau d'éducation : Variable, souvent secondaire ou supérieur
- Contexte professionnel : Employé, indépendant, étudiant
- Expérience technologique : Basique à intermédiaire, utilisation intensive de SMS/WhatsApp
- Revenu : Variable selon la classe sociale

**Comportements et Motivations :**

- Vit dans des logements locatifs urbains
- Attache de l'importance à la transparence et à la rapidité
- Utilise principalement les communications mobiles
- Sensible aux coûts et aux délais

**Douleurs Actuelles :**

- Factures tardives et peu claires
- Contestations fréquentes sur les montants
- Manque de preuves des relevés
- Retards de paiement dus à des relances inefficaces

**Objectifs et Désirs :**

- Réception rapide des factures (jour même ou lendemain)
- Transparence totale sur les calculs (index, consommation, montant)
- Preuves visuelles des relevés
- Processus de paiement simple

**Citation Représentative :** "Pour la première fois, je reçois ma facture d'eau le jour même avec les vrais chiffres et une photo du compteur !"

### Persona Secondaire 2: Comptable/Assistant

**Profil Démographique :**

- Âge : 25-45 ans
- Niveau d'éducation : Supérieur (comptabilité, gestion)
- Contexte professionnel : Comptable externe ou assistant de gestion
- Expérience technologique : Avancée, utilisation d'outils comptables
- Revenu : Moyen, dépendant des clients

**Comportements et Motivations :**

- Travaille pour plusieurs clients gestionnaires
- Nécessite des données structurées et fiables
- Focus sur la conformité et les audits
- Utilise Excel et logiciels comptables

**Douleurs Actuelles :**

- Vérification manuelle de données Excel mal structurées
- Absence d'historique fiable pour les audits
- Corrections d'erreurs de saisie
- Temps perdu sur la restructuration des données

**Objectifs et Désirs :**

- Exports automatiques et structurés (CSV/Excel)
- Historique complet et filtrable
- Données prêtes pour l'intégration comptable
- Réduction du temps de vérification

**Citation Représentative :** "Enfin des données fiables et bien structurées ! Plus besoin de tout vérifier manuellement."

## Parcours Utilisateur

### Parcours Releveur Terrain

1. **Découverte et Formation**
   - Reçoit une formation vidéo de 5-10 minutes
   - Installe l'application et se connecte avec numéro de téléphone
   - Reçoit OTP par SMS pour validation

2. **Préparation Quotidienne**
   - Ouvre l'application avec code PIN ou biométrie
   - Voit la liste des immeubles/logements assignés
   - Liste triée par priorité (immeuble, puis étage)

3. **Relevé sur le Terrain**
   - Sélectionne un compteur dans la liste
   - Voit l'index précédent affiché
   - Prend une photo obligatoire du compteur
   - Saisit l'index actuel (clavier numérique optimisé)
   - Alerte si index inférieur au précédent (avec option de forcer)
   - Validation et passage au compteur suivant

4. **Synchronisation**
   - Sync automatique en WiFi/4G
   - Mode hors-ligne si réseau indisponible
   - Indicateur de statut de synchronisation

5. **Fin de Journée**
   - Vérification des relevés synchronisés
   - Notification de succès/complétude

### Parcours Gestionnaire

1. **Configuration Initiale**
   - Crée un compte gestionnaire
   - Configure les immeubles et logements
   - Définit les tarifs et formules de calcul
   - Importe la liste des locataires

2. **Gestion Quotidienne**
   - Valide les relevés reçus des releveurs
   - Vérifie les photos et index
   - Lance la génération groupée des factures

3. **Suivi et Contrôle**
   - Suit l'état d'envoi des factures (SMS/email)
   - Identifie les échecs d'envoi
   - Relance manuellement si nécessaire

4. **Reporting**
   - Export des données pour comptabilité
   - Suivi des paiements et impayés

### Parcours Locataire

1. **Réception Facture**
   - Reçoit SMS avec montant et lien PDF
   - Clic sur le lien pour voir la facture détaillée

2. **Consultation**
   - Voit les index précédent/actuel
   - Vérifie la consommation calculée
   - Consulte la photo du relevé
   - Voit le détail du calcul (consommation × tarif + taxes)

3. **Paiement**
   - Procède au paiement par canal habituel
   - Reçoit confirmation de paiement

## Exigences Fonctionnelles

### Application Mobile (Android)

#### Authentification et Sécurité

- **REQ-AUTH-001** : Authentification par numéro de téléphone + OTP SMS
- **REQ-AUTH-002** : Support du code PIN ou biométrie pour accès rapide
- **REQ-AUTH-003** : Déconnexion automatique après 30 minutes d'inactivité
- **REQ-AUTH-004** : Chiffrement des données sensibles (photos, données personnelles)

#### Gestion des Données de Base

- **REQ-DATA-001** : Synchronisation des immeubles, logements et compteurs assignés
- **REQ-DATA-002** : Stockage local pour mode hors-ligne complet
- **REQ-DATA-003** : Mise à jour automatique des données de référence

#### Saisie des Relevés

- **REQ-INPUT-001** : Liste des compteurs triée par immeuble/étage/priorité
- **REQ-INPUT-002** : Affichage de l'index précédent pour chaque compteur
- **REQ-INPUT-003** : Capture photo obligatoire avant saisie index
- **REQ-INPUT-004** : Clavier numérique optimisé pour saisie rapide
- **REQ-INPUT-005** : Validation en temps réel de la cohérence des index
- **REQ-INPUT-006** : Alerte bloquante si index actuel < index précédent
- **REQ-INPUT-007** : Option de forcer la saisie avec commentaire obligatoire
- **REQ-INPUT-008** : Horodatage automatique de chaque relevé

#### Mode Hors-Ligne

- **REQ-OFFLINE-001** : Fonctionnement complet sans connexion réseau
- **REQ-OFFLINE-002** : Stockage local des relevés et photos
- **REQ-OFFLINE-003** : Synchronisation automatique à la reconnexion
- **REQ-OFFLINE-004** : Indicateur visuel du statut de synchronisation
- **REQ-OFFLINE-005** : Résolution des conflits de synchronisation

### Backend et Calculs

#### Gestion des Données

- **REQ-BACK-001** : Stockage sécurisé des relevés avec métadonnées (releveur, timestamp, photo)
- **REQ-BACK-002** : Historique complet des index par compteur
- **REQ-BACK-003** : Gestion des immeubles, logements, locataires et compteurs

#### Calcul des Factures

- **REQ-CALC-001** : Formule configurable : (Index_actuel - Index_précédent) × Tarif + Taxes
- **REQ-CALC-002** : Support des tarifs progressifs (tranches)
- **REQ-CALC-003** : Calcul automatique des taxes et frais fixes
- **REQ-CALC-004** : Validation des calculs avant génération facture

#### Génération et Envoi

- **REQ-GEN-001** : Génération PDF facture avec template professionnel
- **REQ-GEN-002** : Inclusion obligatoire : période, index préc./actuel, consommation, montant TTC
- **REQ-GEN-003** : Hébergement sécurisé des PDF avec liens temporaires
- **REQ-GEN-004** : Envoi prioritaire par SMS avec lien PDF
- **REQ-GEN-005** : Envoi complémentaire par email si disponible
- **REQ-GEN-006** : Logs détaillés des envois (succès/échec, timestamp)

### Interface Web Gestionnaire

#### Configuration

- **REQ-WEB-001** : Interface d'administration des immeubles et logements
- **REQ-WEB-002** : Gestion des compteurs (numéro, localisation, index initial)
- **REQ-WEB-003** : Configuration des tarifs et formules de calcul
- **REQ-WEB-004** : Import/export des données locataires

#### Validation et Génération

- **REQ-WEB-005** : Dashboard des relevés en attente de validation
- **REQ-WEB-006** : Visualisation des photos de relevé
- **REQ-WEB-007** : Validation groupée ou individuelle des relevés
- **REQ-WEB-008** : Lancement de génération/envoi groupé des factures

#### Suivi et Reporting

- **REQ-WEB-009** : Historique des factures envoyées avec statuts
- **REQ-WEB-010** : Indicateurs de succès d'envoi (SMS/email)
- **REQ-WEB-011** : Export des données au format CSV/Excel

## Exigences Non-Fonctionnelles

### Performance

- **REQ-PERF-001** : Temps de démarrage application < 3 secondes
- **REQ-PERF-002** : Saisie d'un relevé complet < 30 secondes
- **REQ-PERF-003** : Synchronisation des données < 10 secondes par Mo
- **REQ-PERF-004** : Génération facture < 5 secondes
- **REQ-PERF-005** : Envoi SMS réussi > 98% des cas

### Sécurité

- **REQ-SEC-001** : Chiffrement AES-256 des données sensibles
- **REQ-SEC-002** : Authentification à deux facteurs obligatoire
- **REQ-SEC-003** : Accès basé sur les rôles (releveur, gestionnaire)
- **REQ-SEC-004** : Audit logs de toutes les opérations sensibles
- **REQ-SEC-005** : Conformité RGPD pour les données personnelles

### Fiabilité

- **REQ-REL-001** : Disponibilité backend > 99.5%
- **REQ-REL-002** : Mode hors-ligne fonctionnel 100% du temps
- **REQ-REL-003** : Récupération automatique des pannes < 1 heure
- **REQ-REL-004** : Sauvegarde automatique des données toutes les 6 heures

### Utilisabilité

- **REQ-USAB-001** : Interface adaptée aux écrans 5-6 pouces
- **REQ-USAB-002** : Support des langues française et anglaise
- **REQ-USAB-003** : Accessibilité pour utilisateurs malvoyants (contraste, taille texte)
- **REQ-USAB-004** : Formation utilisateur < 10 minutes

### Compatibilité

- **REQ-COMP-001** : Android 8.0+ (couverture > 90% marché africain)
- **REQ-COMP-002** : Navigateurs web modernes (Chrome, Firefox, Safari)
- **REQ-COMP-003** : Réseaux 2G/3G/4G avec optimisation faible bande passante

## Critères d'Acceptation

### Critères d'Acceptation Fonctionnels

#### Authentification

- **AC-AUTH-001** : L'utilisateur peut s'authentifier avec numéro téléphone + OTP
- **AC-AUTH-002** : Le code PIN fonctionne pour accès rapide
- **AC-AUTH-003** : La session expire après 30 minutes d'inactivité

#### Saisie Relevés

- **AC-INPUT-001** : La photo est obligatoire avant saisie index
- **AC-INPUT-002** : Une alerte apparaît si index actuel < précédent
- **AC-INPUT-003** : L'utilisateur peut forcer avec commentaire obligatoire
- **AC-INPUT-004** : Le relevé est horodaté automatiquement

#### Calcul et Génération

- **AC-CALC-001** : La facture affiche index préc./actuel, consommation, montant TTC
- **AC-CALC-002** : Le PDF est généré en < 5 secondes
- **AC-CALC-003** : Le lien PDF est valide 30 jours

#### Envoi Factures

- **AC-SEND-001** : Le SMS est envoyé en priorité avec lien PDF
- **AC-SEND-002** : L'email est envoyé en complément si configuré
- **AC-SEND-003** : Le taux de succès SMS > 98%

### Critères d'Acceptation Qualitatifs

#### Satisfaction Utilisateur

- **AC-SAT-001** : NPS gestionnaire > +30 après 3 mois
- **AC-SAT-002** : Temps relevé < 3-4 minutes en moyenne
- **AC-SAT-003** : Réduction temps gestionnaire ≥ 70%
- **AC-SAT-004** : Réduction litiges ≥ 50%

#### Performance Opérationnelle

- **AC-OPS-001** : Taux synchronisation > 95%
- **AC-OPS-002** : Taux adoption > 70% des relevés
- **AC-OPS-003** : Taux recouvrement +15-25 points

## Spécifications Techniques MVP

### Architecture Générale

- **Frontend Mobile** : React Native ou Flutter pour Android
- **Backend** : Node.js/Express ou Python/FastAPI
- **Base de Données** : PostgreSQL pour données structurées
- **Stockage Fichiers** : AWS S3 ou équivalent pour photos/PDF
- **SMS** : Service fournisseur local (Orange, MTN) ou international (Twilio)
- **Hébergement** : Cloud provider avec région Afrique (AWS Cape Town, Azure South Africa)

### APIs et Intégrations

- **API REST** : Pour communication mobile-backend
- **Webhooks** : Pour notifications d'envoi SMS
- **Intégration SMS** : API REST avec fournisseur sélectionné
- **Authentification** : JWT avec refresh tokens

### Données et Modèles

#### Entités Principales

- **Utilisateur** : releveur, gestionnaire (rôles)
- **Immeuble** : nom, adresse, gestionnaire
- **Logement** : numéro, immeuble, locataire
- **Compteur** : numéro, logement, index_initial, tarif
- **Relevé** : compteur, index, photo, timestamp, releveur
- **Facture** : relevé, montant, PDF_URL, statut_envoi

#### Schéma Base de Données

```sql
-- Tables principales (version simplifiée)
CREATE TABLE users (id, phone, role, created_at);
CREATE TABLE buildings (id, name, address, manager_id);
CREATE TABLE apartments (id, number, building_id, tenant_name, tenant_phone);
CREATE TABLE meters (id, number, apartment_id, initial_index, rate_id);
CREATE TABLE readings (id, meter_id, index_value, photo_url, timestamp, user_id);
CREATE TABLE invoices (id, reading_id, amount, pdf_url, sms_status, email_status);
```

## Plan de Développement MVP

### Phase 1 (Semaines 1-4): Fondation

- Configuration projet et architecture de base
- Authentification et gestion utilisateurs
- Modèle de données de base
- Interface web basique pour configuration

### Phase 2 (Semaines 5-8): Application Mobile Core

- Interface mobile de base
- Authentification mobile
- Liste des compteurs et navigation
- Saisie relevés avec validation basique

### Phase 3 (Semaines 9-12): Photos et Hors-Ligne

- Capture et stockage photos
- Mode hors-ligne complet
- Synchronisation automatique
- Validation avancée des index

### Phase 4 (Semaines 13-16): Calculs et Factures

- Moteur de calcul des factures
- Génération PDF
- Intégration SMS pour envoi
- Interface web pour validation et lancement

### Phase 5 (Semaines 17-20): Tests et Lancement

- Tests utilisateurs pilotes
- Corrections de bugs
- Optimisations performance
- Documentation et formation

## Risques et Mitigation

### Risques Techniques

- **Réseau instable** : Mode hors-ligne complet + sync optimisée
- **Stockage photos** : Compression automatique + nettoyage périodique
- **Fiabilité SMS** : Fournisseur backup + retry automatique

### Risques Business

- **Adoption lente** : Formation utilisateurs + support initial
- **Concurrence** : Différenciation par simplicité et coût
- **Réglementation** : Conformité aux lois locales sur données

### Risques Produit

- **Complexité interface** : Tests utilisateurs itératifs
- **Performance mobile** : Optimisations spécifiques Android low-end
- **Support multilingue** : Internationalisation dès la conception

## Métriques de Succès Détaillées

### Métriques Quantitatives Clés

| Métrique               | Objectif MVP (3 mois) | Objectif Mature (12 mois) | Fréquence Mesure |
| ---------------------- | --------------------- | ------------------------- | ---------------- |
| Taux adoption relevés  | >70%                  | >90%                      | Mensuel          |
| Temps moyen par relevé | <3 min                | <2 min                    | Par session      |
| Taux succès envoi SMS  | >98%                  | >99.5%                    | Quotidien        |
| Réduction litiges      | ≥50%                  | ≥70%                      | Mensuel          |
| NPS gestionnaires      | >+30                  | >+50                      | Trimestriel      |
| Taux recouvrement 15j  | +15-25 pts            | +30-40 pts                | Mensuel          |

### Métriques Qualitatives

- Feedback utilisateurs via enquêtes in-app
- Interviews utilisateurs clés (5-10 par trimestre)
- Analyse des logs d'usage pour patterns comportementaux
- Suivi des bugs et demandes d'évolution

### Indicateur North Star

**Temps économisé mensuellement + Taux de recouvrement dans les délais**

Ce KPI combine l'efficacité opérationnelle (temps = argent) avec l'impact financier direct (cashflow), capturant la valeur business essentielle de WaterHouse.

---

_Document créé le 26 janvier 2026 - Version 1.0_
_Basé sur le Product Brief du 26 janvier 2026_
_Auteur : Équipe BMM WaterHouse_</content>
<parameter name="filePath">/home/tims/Dev1.0/WaterHouse/\_bmad-output/planning-artifacts/product-requirements-document-WaterHouse-2026-01-26.md
