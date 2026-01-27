# Projet : Application Relevé Compteurs d’Eau & Facturation Locataires

**Type** : MVP – Relevé manuel – Envoi facture par SMS prioritaire  
**Contexte** : Gestion locative (Cameroun / Afrique francophone)  
**Objectif global** : Remplacer la gestion papier / Excel par une solution mobile + web simple, fiable et rapide

## Phase 0 – Préparation & Décision (1–2 semaines)

- [ ] Définir le périmètre exact du MVP (ce qu’on fait / ne fait PAS dans la v1)
- [ ] Lister les parties prenantes : propriétaire(s), gestionnaire, releveur(s), locataires, comptable
- [ ] Recueillir les règles de facturation actuelles (tarifs, tranches, taxes, frais fixes, période de facturation)
- [ ] Décider des moyens d’envoi prioritaires : SMS > Email > Notification push
- [ ] Choisir le fournisseur SMS (Twilio, BulkSMS, Africa’s Talking, local camerounais, etc.)
- [ ] Estimer le volume : nombre d’immeubles, nombre de compteurs, fréquence des relevés
- [ ] Fixer le budget approximatif et la date cible de mise en production
- [ ] Choisir la stack technologique cible

**Stack recommandée MVP 2025–2026**  
Mobile : React Native (ou Flutter)  
Web admin : React + Vite  
Backend : Node.js / NestJS (TypeScript)  
Base de données : PostgreSQL  
Hébergement : VPS ou Render / Railway / Vercel + Supabase / Neon (PostgreSQL)  
SMS : Africa’s Talking ou Twilio  
Stockage PDF : S3 ou Cloudinary ou dossier local sécurisé

## Phase 1 – Analyse & Spécifications (2–3 semaines)

- [ ] Rédiger la liste des personas (releveur, gestionnaire, locataire)
- [ ] Écrire les **user stories** prioritaires (format : En tant que … je veux … afin de …)
- [ ] Définir les entités principales et leurs relations (schéma conceptuel)
  - Immeuble / Bâtiment
  - Logement / Appartement
  - Compteur (numéro, marque, diamètre, index précédent, photo précédente)
  - Locataire (nom, prénom, téléphone, email, logement)
  - Relevé (date, index, photo, releveur, remarque)
  - Facture (période, conso, montant HT, taxes, TTC, statut paiement)
- [ ] Définir les règles de calcul de la facture (formule exacte)
- [ ] Lister les champs obligatoires / optionnels sur chaque écran
- [ ] Rédiger les cas d’erreur à gérer (index inférieur au précédent, absence de réseau, etc.)
- [ ] Produire un glossaire métier (index, conso, releveur, etc.)

## Phase 2 – Conception & Design (2–4 semaines)

- [ ] Créer la structure de la base de données (schéma PostgreSQL)
- [ ] Dessiner les wireframes / mockups principaux (Figma, Penpot, Excalidraw)
  - Écran accueil releveur
  - Liste des relevés à faire
  - Écran de saisie d’un relevé (gros champ index + photo + alerte)
  - Écran de validation / synchronisation
  - Tableau de bord gestionnaire
  - Page détail facture
  - Historique relevés / factures
- [ ] Définir le design system minimal (couleurs, typographie, tailles)
- [ ] Décider du modèle d’authentification (téléphone + code OTP ? email/mdp ?)
- [ ] Planifier la gestion offline → online (stratégie de synchronisation)

## Phase 3 – Développement (6–12 semaines selon équipe)

### 3.1 Setup projet & infrastructure

- [ ] Créer repositories Git (mobile, backend, web-admin)
- [ ] Configurer CI/CD de base (GitHub Actions)
- [ ] Mettre en place la base PostgreSQL (local + hébergée)
- [ ] Installer & configurer l’environnement de dev mobile (émulateurs)

### 3.2 Backend (API)

- [ ] Authentification & rôles (releveur, admin, locataire lecture seule)
- [ ] CRUD Immeubles / Logements / Compteurs / Locataires
- [ ] Endpoint création relevé (avec validation index)
- [ ] Calcul consommation & génération facture (logique + PDF)
- [ ] File d’attente / job pour envoi SMS/email (BullMQ, Agenda, ou simple setTimeout)
- [ ] Endpoint historique relevés & factures
- [ ] Gestion des pièces jointes (photo compteur → stockage)

### 3.3 Application Mobile (React Native)

- [ ] Authentification
- [ ] Écran liste des compteurs à relever (tri, filtres)
- [ ] Écran saisie relevé (offline)
  - Gros champ numérique
  - Bouton photo (caméra + galerie)
  - Alerte si index < précédent
  - Champ remarque
  - Validation biométrique ou code PIN optionnel
- [ ] Mode synchronisation (manuel + auto quand réseau)
- [ ] Consultation historique personnel
- [ ] Gestion des erreurs réseau claire

### 3.4 Interface Web Admin

- [ ] Dashboard (nombre relevés effectués, en retard, factures envoyées)
- [ ] Gestion complète des immeubles, logements, locataires, compteurs
- [ ] Visualisation et correction manuelle des relevés
- [ ] Génération / visualisation / renvoi factures
- [ ] Export Excel / CSV des données

## Phase 4 – Tests & Recette (3–5 semaines)

- [ ] Tests unitaires backend (logique calcul, validation index)
- [ ] Tests unitaires / composants mobile
- [ ] Tests d’intégration (API + mobile)
- [ ] Tests manuels terrain (vrai téléphone, vrai immeuble, sans réseau)
- [ ] Simulation de 50–200 relevés
- [ ] Tests envoi SMS (coût réel, délai, réception)
- [ ] Tests sécurité de base (accès non autorisé, injection)
- [ ] Recette avec 2–3 releveurs réels + 1 gestionnaire
- [ ] Correction des bugs prioritaires

## Phase 5 – Déploiement & Lancement (1–3 semaines)

- [ ] Préparer les stores (Google Play + App Store)
  - Icônes, screenshots, description
  - Politiques de confidentialité
- [ ] Déployer backend + base de données en production
- [ ] Configurer monitoring de base (logs + erreurs)
- [ ] Migrer les données existantes (Excel → base)
- [ ] Former les releveurs (vidéo 5–10 min + session live)
- [ ] Lancer un pilote sur 1–2 immeubles (20–50 compteurs)
- [ ] Suivi intensif première semaine (hotline / WhatsApp)
- [ ] Déployer en général une fois pilote validé

## Phase 6 – Suivi post-lancement (Ongoing)

- [ ] Collecter les retours (WhatsApp, email, formulaire in-app)
- [ ] Corriger bugs critiques rapidement
- [ ] Ajouter les fonctionnalités très demandées (roadmap v1.1)
  - Relances automatiques impayés
  - Paiement mobile money intégré
  - Multi-tarifs par immeuble
  - Statistiques conso
- [ ] Mettre à jour l’application mobile régulièrement
- [ ] Surveiller le coût SMS (optimisation messages)

## Livrables attendus par phase (checklist synthétique)

| Phase | Livrables principaux                                                 |
| ----- | -------------------------------------------------------------------- |
| 0     | Périmètre MVP, choix stack, budget/timing                            |
| 1     | User stories, schéma entités, règles facturation                     |
| 2     | Maquettes Figma, schéma base de données                              |
| 3     | Code source complet (mobile + backend + web), documentation API      |
| 4     | Rapport de tests, liste bugs corrigés, validation pilote             |
| 5     | Application publiée, premier lot de factures envoyé, formation faite |
| 6     | Retours collectés, 3 premiers correctifs publiés                     |

Bon courage pour la réalisation !  
N’hésitez pas à demander le détail d’une étape précise (exemple : schéma base de données, user stories détaillées, écran de saisie type, etc.)
