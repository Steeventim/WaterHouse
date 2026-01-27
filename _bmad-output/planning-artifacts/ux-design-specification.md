---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments: ["product-brief-WaterHouse-2026-01-26.md", "prd.md", "architecture.md", "epics-and-stories.md", "prd-validation-report.md"]
---

# UX Design Specification WaterHouse

**Author:** Tims_team
**Date:** 2026-01-26

---

## Executive Summary

### Project Vision

WaterHouse vise à révolutionner la gestion locative en Afrique francophone en remplaçant les processus manuels de relevé des compteurs d'eau par une solution mobile intuitive et fiable. L'application permet des relevés sécurisés avec photos, des calculs automatiques conformes aux tarifs locaux, et l'envoi instantané de factures par SMS ou email, éliminant les erreurs, réduisant les litiges et améliorant la traçabilité pour renforcer l'image professionnelle des gestionnaires.

### Target Users

- **Releveurs terrain** : Agents mobiles utilisant des smartphones Android bas de gamme, travaillant dans des environnements urbains avec réseaux instables, motivés par la simplicité et la rapidité pour éviter les disputes.
- **Gestionnaires immobiliers** : Propriétaires ou gestionnaires d'immeubles (1-30 logements), techniquement compétents, cherchant à réduire drastiquement leur temps de travail (de jours à heures) et à améliorer les collectes.
- **Locataires** : Résidents urbains en Afrique francophone, utilisant principalement SMS/WhatsApp, valorisant la transparence et la rapidité pour éviter les surprises financières.
- **Comptables externes** : Assistants utilisant des outils de comptabilité, nécessitant des exports structurés pour audits et rapports.

### Key Design Challenges

- **Contexte africain** : Réseaux instables nécessitant un mode hors-ligne robuste, priorité SMS pour la fiabilité, adaptation aux smartphones Android low-end.
- **Diversité des utilisateurs** : De releveurs peu techniciens à gestionnaires experts, avec des besoins variés (mobilité vs supervision vs transparence).
- **Traçabilité et preuves** : Intégrer photos horodatées et logs d'envoi comme éléments centraux de confiance, sans alourdir l'interface.
- **Multilinguisme et localisation** : Interface en français, tarifs configurables selon réglementations locales camerounaises/africaines.

### Design Opportunities

- **Expérience mobile first** : Créer une interface ultra-simple pour releveurs, avec guidance visuelle et validations anti-erreur pour paraître professionnel.
- **Dashboard intuitif** : Offrir une vue d'ensemble claire pour gestionnaires, avec actions prioritaires (validation, envoi) mises en avant.
- **Transparence locataire** : Utiliser SMS comme canal privilégié pour des communications claires et accessibles, renforçant la confiance.
- **Innovation africaine** : Tirer parti des habitudes locales (SMS, réseaux mobiles) pour une adoption rapide et une différenciation concurrentielle.

## Core User Experience

### Defining Experience

L'expérience cœur de WaterHouse repose sur la saisie fluide et sécurisée des relevés de compteurs d'eau par les releveurs mobiles, créant une chaîne de valeur fiable qui aboutit à des factures précises envoyées automatiquement aux locataires. L'interaction clé de voûte est l'écran de saisie du relevé (sélection compteur → index + photo → validation), répété 50-400 fois par mois, qui doit être maîtrisé parfaitement pour assurer l'adoption et la fiabilité du système.

### Platform Strategy

- **Mobile-first Android** : Application native React Native ciblant Android 8.0+ (couverture >95% Cameroun), optimisée pour smartphones bas/moyen de gamme (écrans 5-6.5", batteries limitées).
- **Backend web responsive** : Interface de gestion pour propriétaires/gestionnaires, accessible sur desktop/mobile web, avec dashboard priorisant les actions critiques (validation, envoi groupé).
- **Offline-first** : Mode hors-ligne complet avec synchronisation hybride (automatique en background + manuelle sur demande), utilisant Realm pour le stockage local fiable.
- **Contraintes adaptées** : Thème sombre par défaut pour lisibilité extérieure, touch targets ≥48dp, gestes simples (swipe horizontal), compression photo agressive pour économie data/batterie.

### Effortless Interactions

- **Saisie d'index** : Champ numérique énorme (80% écran), clavier tactile réactif, auto-focus, validation en 1 tap, feedback visuel/haptique immédiat.
- **Prise de photo** : Auto-déclenchement après stabilité, recadrage automatique sur cadran, flash intelligent, preview avec re-prendre facile.
- **Navigation** : Liste triée par adresse/immeuble, swipe horizontal infini pour suivant/précédent, filtres rapides, barre progression colorée.
- **Synchronisation** : Transparente 95% du temps, avec feedback clair (badge "X en attente", progression, succès/échec explicite).
- **Validation globale** : Écran célébration après immeuble terminé, avec auto-check incohérences et bouton sync groupé.

### Critical Success Moments

- **Releveur** : Validation du dernier relevé d'immeuble + sync réussie → écran vert avec confettis, vibration forte, toast "Immeuble X terminé ! 48/48 relevés envoyés".
- **Gestionnaire** : Envoi groupé factures terminé → progress bar 100% verte, liste avec ✅, notification "Factures du mois envoyées – 98% reçus".

### Experience Principles

- **Simplicité radicale** : Chaque interaction doit prendre <3 secondes de réflexion ; éliminer tout friction inutile pour les releveurs peu techniciens.
- **Fiabilité africaine** : Priorité offline, sync robuste malgré réseaux instables, feedback explicite pour rassurer en cas d'échec.
- **Preuve et confiance** : Photos horodatées et logs comme éléments centraux, intégrés naturellement sans alourdir l'interface.
- **Célébration des victoires** : Feedback visuel/haptique pour récompenser les succès critiques, renforçant l'engagement.
- **Mobile terrain-optimized** : Design pour extérieur (contraste élevé, gestes larges), économie ressources (batterie/data), tests réels dès early stages.

## Desired Emotional Response

### Primary Emotional Goals

- **Sérénité confiante** : Sentiment dominant de maîtrise sans effort, éliminant le stress des erreurs et litiges, différenciant WaterHouse des processus manuels chaotiques.
- **Fierté productive** : Accomplissement joyeux après chaque tâche réussie, amplifiant le bouche-à-oreille ("Wow, ça existe vraiment ?").
- **Soulagement durable** : Passage du chaos (stress, frustration) au calme contrôlé, renforçant la fidélité et l'adoption.

### Emotional Journey Mapping

- **Découverte initiale** : Surprise positive et curiosité ("C'est si simple, ça pourrait vraiment marcher ici").
- **Pendant l'usage** : Releveurs (soulagés, confiants, productifs, fiers) ; Gestionnaires (en contrôle, calmes, soulagés, professionnels) ; Locataires (surpris agréablement, en sécurité, respectés).
- **Après accomplissement** : Releveurs (soulagés + fiers + satisfaits) ; Gestionnaires (soulagés + en contrôle + calmes satisfaits) ; Locataires (surpris agréablement + respectés).
- **En cas d'erreur** : Confiance maintenue grâce à feedback explicite rassurant, évitant la frustration.
- **Retour à l'usage** : Anticipation positive, comme un outil fiable qui "gère tout tranquillement".

### Micro-Emotions

- **Confiance vs. Scepticisme** : Construire la confiance via preuves visuelles et feedback immédiat.
- **Fierté vs. Honte** : Célébrer les succès pour renforcer la fierté, éliminer la honte des erreurs passées.
- **Soulagement vs. Stress** : Priorité au soulagement post-tâche pour contrer le stress manuel.
- **Satisfaction vs. Frustration** : Interactions fluides pour maximiser la satisfaction, minimiser la frustration technique.

### Design Implications

- **Sérénité confiante** → Feedback visuel/haptique rassurant (écrans verts, vibrations douces, toasts positifs) ; mode offline robuste avec sync transparente.
- **Fierté productive** → Moments de célébration discrets (confettis, badges progression) ; statistiques personnelles ("Tu as économisé X heures ce mois-ci").
- **Soulagement durable** → Interfaces épurées, automatisations (calculs, envois), évitement des frictions inutiles.
- **Émotions à éviter** : Frustration (bugs, lenteurs), scepticisme (manque de preuves), honte (erreurs visibles).

### Emotional Design Principles

- **Célébration des victoires** : Chaque succès critique (relevé terminé, envoi réussi) déclenche un feedback positif pour ancrer la fierté.
- **Transparence rassurante** : Photos, logs et confirmations visibles pour nourrir la confiance et réduire l'anxiété.
- **Simplicité joyeuse** : Interactions "magiques" (auto-déclenchement photo, swipe fluide) pour transformer la routine en plaisir subtil.
- **Adaptation africaine** : Mode sombre, gestes larges, économie ressources pour usage prolongé en conditions réelles.

## UX Pattern Analysis & Inspiration

### Inspiring Products & Apps

- **Productivité/Field Work** : Notion/Todoist pour la fluidité zero-friction et l'offline parfait ; Google Keep pour la saisie rapide et contextuelle.
- **Banques** : Revolut/N26/Monzo/Wave pour dashboards clairs, feedback instantané, biometrics rapides et style "calme en contrôle".
- **Livraison** : Uber/Glovo/Jumia pour tracking temps réel, cartes simples, swipe actions, mode sombre auto et prise de photo intégrée.
- **Fitness/Progression** : Strava/Nike Run Club pour progress bars motivantes, confettis sur milestones, historique visuel ; Duolingo pour streaks et récompenses légères.

### Relevant UX Patterns

- **Livraison** : Progression linéaire + swipe horizontal pour navigation compteurs ; feedback temps réel (check vert) pour validations.
- **Fitness** : Gamification légère (badges "Immeuble maîtrisé", streaks mensuels) ; animations sur succès critiques.
- **Banques** : Gros boutons primaires, high-contrast, mode sombre par défaut ; alertes colorées pour incohérences.
- **Field Data** : Offline-first avec queue sync visible (badge "X en attente") ; photo intégrée avec timestamp et preview immédiat.
- **Notes** : Saisie contextuelle + auto-save ; couleur-coded pour statuts (gris = non fait, vert = fait).
- **Onboarding** : Flux minimal en 3 écrans avec micro-interactions joyeuses.

### Visual Style & Interaction Guidelines

- **Palette** : Fond dark gray (#121212), accents vert (#4CAF50), jaune (#FFEB3B), rouge (#EF5350) ; texte blanc/off-white pour contraste WCAG AA+.
- **Typographie** : Sans-serif (Inter/Roboto) ; tailles généreuses (index ≥48-60sp, labels ≥16sp).
- **Interactions** : Micro-animations subtiles (fade-in, bounce léger, ripple Android) ; haptique (vibration courte OK, longue erreur) ; icônes Material You adaptatives, rounded corners 12-16dp.
- **Style Global** : Minimaliste professionnel, high-contrast dark mode obligatoire pour lisibilité extérieure ; éviter flashy/gradients pour sérieux pro.

### Inspiration Principles

- **Fluidité terrain** : <3 taps pour actions principales, feedback immédiat (visuel/haptique) pour sérénité confiante.
- **Confiance bancaire** : Éléments visuels propres, progressions claires, célébrations discrètes pour fierté productive.
- **Motivation subtile** : Streaks, badges, animations légères pour transformer routine en accomplissement joyeux.
- **Adaptation africaine** : Mode sombre, gestes larges, économie ressources pour usage prolongé en conditions réelles.

## Design System Choice

### Chosen Design System Approach

**Base System** : Material Design 3 (MD3) comme fondation principale, avec personnalisation modérée pour WaterHouse.
- **Raison** : Idéal pour Android (high-contrast, adaptive layouts, offline-friendly, gestes natifs), accélère le développement React Native via libraries comme React Native Paper v5+.
- **Avantages** : Composants prêts (gros boutons, swipe, dark mode), accessibilité intégrée, cohérence avec écosystème Android dominant au Cameroun.
- **Inconvénients évités** : Pas de création 100% personnalisée chronophage ; différenciation via theming sans réinventer la roue.

### Customization Level

**Niveau Modéré (2/3)** : Personnalisation focalisée sur essentials pour style minimaliste professionnel + dark mode high-contrast.
- **Thème Override (Niveau 1)** : Dark mode forcé par défaut (#121212 fond, #E0E0E0 texte) ; palette simple (vert #4CAF50 succès, jaune #FFEB3B alerte, rouge #EF5350 erreur) ; typo Roboto avec tailles augmentées (index ≥48sp).
- **Composants Adaptés (Niveau 2)** : Boutons gros/centrés avec ripple vert ; high-contrast (bordures épaisses) ; micro-animations (fade-in validation, vibration haptique) ; icônes custom (compteur, sync cloud via Material Icons modifiés).
- **Évitée** : Personnalisation avancée (composants uniques, theming dynamique) – réservée post-MVP pour focus rapidité.

### Cross-Platform Consistency Strategy

**Système Partagé via Monorepo** : Design system unifié pour cohérence mobile (React Native) et web (React responsive).
- **Package Shared (@waterhouse/ui)** : Tokens JSON (colors.json, spacing.ts) exportés ; composants core (Button, Input, Card) réutilisables.
- **Thèmes & Styles** : Tamagui ou Styled Components pour cross-platform ; Android Material You adaptive, web media queries (min-width 600px).
- **Interactions & Flux** : Patterns communs (saisie flow identique) ; React Navigation (RN) + React Router (web) avec routes partagées ; gestes natifs Android (swipe back, long-press).
- **Responsive & Adaptatif** : Breakpoints partagés (mobile-first 320-600px, desktop 600+) ; tests Detox (RN) + Cypress (web) ; layout vertical stack pour petits écrans, dark mode boost luminosité.
- **Outils** : Monorepo Nx/Turbo pour build unifié ; Storybook pour visualisation côte à côte ; Figma kit partagé avec tokens exportés.

### Design System Principles

- **Android-First** : Priorité gestes natifs, perf bas de gamme, accessibilité (TalkBack) pour releveurs terrain.
- **Minimalisme Pro** : Espaces généreux, focus 1-2 actions/écran, éviter flashy pour confiance bancaire.
- **Maintenance Agile** : Thèmes JSON faciles à modifier ; tests cross-device dès sprint 1 sur Tecno/Infinix.
- **Évolutivité** : Base MD3 extensible pour futures personnalisations avancées (v1.1+).

## Defining Core Experience

### The Defining Interaction

**Interaction Centrale** : La saisie d'un index de compteur d'eau sur l'écran mobile du releveur, suivie immédiatement de validation (avec photo et contrôle d'incohérence).
- **Séquence Définissante** : Sélection compteur → affichage gros champ index (auto-focus) → saisie chiffres → prise photo (preview rapide) → validation (tap gros bouton/swipe) → feedback instantané (vert + vibration OK, alerte + vibration + popup incohérent).
- **Fréquence** : 50-400 fois/mois par releveur – l'interaction répétée qui forge l'opinion globale sur l'app.

### Cascade Effects of Perfection

Si maîtrisée parfaitement (<15-20s/relevé, zéro friction, fiabilité >99%, sensation fluidité/contrôle) :
- **Données Fiables** : Index corrects affluent automatiquement → backend génère factures justes → adoption releveurs >80-90%.
- **Réduction Litiges** : Erreurs quasi-zéro → confiance releveurs → bouche-à-oreille naturel.
- **Satisfaction Gestionnaire** : Corrections manuelles minimales → dashboard/envoi groupé perçus comme bonus → NPS >+50.
- **Perception Globale** : Effet halo rehausse écrans secondaires (historique, sync) → rétention élevée, paiement locataires plus rapide.

### What Makes It Special

- **Adaptation Terrain** : Gros champ (48-60sp), high-contrast dark mode, touch targets énormes, lisibilité soleil direct sur Android bas de gamme.
- **Contrôle Anti-Litige** : Alerte bloquante si index < précédent + photo obligatoire + remarque forcée → réduction litiges 70-90%.
- **Offline-First Invisible** : Saisie sans réseau (Realm), sync auto background → zéro stress connexion.
- **Preuve Intégrée** : Photo preview + recadrage auto + compression → preuve anti-contestation sans effort.
- **Flow Série Rapide** : <3 taps/relevé moyen, swipe/auto-next → sensation addictive de fluidité.
- **Feedback Immédiat** : Vibration + vert/rouge + son discret → contrôle total sans lecture texte.
- **Contexte Métier Fort** : Détails pensés facturation eau (alerte conso anormale, progression immeuble) – pas générique.

### Defining Experience Principles

- **Interaction Pivot** : Tout repose sur cette séquence – excellence ici crée confiance globale et adoption.
- **Transformation Corvée-Plaisir** : De stress manuel à contrôle fluide → fierté productive et sérénité confiante.
- **Différenciation Africaine** : Adaptée extérieur/connexions instables → unique vs apps génériques.
- **Effet Halo Massif** : Perfection ici rehausse perception de l'app entière, comme paiement 1-tap pour banques.

## Visual Foundation

### Color Palette

**Thème Dark Mode Obligatoire** : Fond très sombre pour réduction glare extérieur, lisibilité maximale.
- **Fond Principal** : #0F1115/#121212 – sérénité, adapté soleil direct.
- **Texte Principal** : #F5F5F5/#E0E0E0 – haute lisibilité sur fond sombre.
- **Texte Secondaire** : #AAAAAA – hiérarchie claire sans pollution.
- **Accent Succès** : #66BB6A – validations, progressions, fierté productive (émotion dominante).
- **Accent Alerte** : #FFCA28 – incohérences, forçages, jaune vif sans panique.
- **Accent Erreur** : #EF5350 – erreurs bloquantes, utilisation rare.
- **Accent Info** : #42A5F5 – sync, liens, confiance discrète.

**Règles Palette** : <6 couleurs, pas de flashy/gradients, vert succès omniprésent pour émotion positive.

### Typography

**Police Principale** : Inter (moderne, pro) ou Roboto (système Android, 0 poids).
- **Index Actuel** : 48-60sp Bold/SemiBold – énorme, 50% écran visuel.
- **Titres** : 20-26sp Medium/Bold – numéro logement/compteur, titre écran.
- **Texte Normal** : 16-18sp Regular – montants, noms, dates (minimum 16sp lisibilité terrain).
- **Texte Secondaire** : 14sp Regular – labels, dates.
- **Très Petit** : 12sp Regular – mentions légales (rare).

**Règle** : Minimum 16sp pour textes lus en extérieur/mouvement.

### Spacing & Layout Principles

**Philosophie** : Mobile-first, gros touch targets, respiration, focus 1 action/écran.
- **Padding/Marges Externes** : 16-24dp côtés écrans (24dp petits écrans).
- **Espacement Vertical** : Séquence 8-12-16-24-32-40dp (Material).
- **Touch Targets** : 48x48dp minimum, boutons 56-64dp hauteur, pleine largeur.
- **Layout Saisie Index** : Champ 50-70% hauteur, photo dessous/à côté, photo preview dessous/à côté, bouton bas pleine largeur.
- **Barre Progression** : Haut discrète.

**Cohérence Cross-Platform** : Même séquences espacement, marges +4-8dp web, palette/tailles relatives identiques.

### Visual Foundation Principles

- **Lisibilité Terrain** : Dark mode, contrastes élevés, tailles généreuses pour soleil/écrans petits.
- **Émotion Verte** : Succès omniprésent pour fierté, sérénité sombre pour calme.
- **Minimalisme Pro** : Palette resserrée, espacements respirants, focus action principale.
- **Cohérence Android/Web** : Tokens partagés, adaptation responsive sans rupture.

## Design Directions

### Chosen Direction: Minimaliste Professionnel

**Style Global** : Épuré, dark mode strict, vert succès dominant, adapté terrain africain.
- **Émotion** : Sérénité confiante, fierté productive, minimalisme pro.
- **Avantages** : Cohérent contraintes (soleil, écrans petits), adoption facile, ressemble apps bancaires africaines.

### Key Screen Mockups

**Écran Saisie Index (Cœur de l'App)** :
- Fond #121212, champ index 48-60sp centré (50% hauteur), texte #E0E0E0.
- Bouton "Valider" pleine largeur bas, vert #66BB6A, 64dp hauteur.
- Photo preview dessous, icône sync bleu #42A5F5 haut droite.
- Barre progression vert discret haut.

**Écran Liste Compteurs** :
- Liste verticale, chaque item 64dp hauteur, numéro logement 22sp bold, statut (gris/vert).
- Swipe horizontal pour navigation, filtres rapides (boutons 48dp).
- Fond sombre, texte clair, espacement 16dp entre items.

**Écran Dashboard Gestionnaire (Web/Mobile)** :
- Cards pour immeubles, progress bars vertes, boutons "Envoyer factures" pleine largeur.
- Palette identique, responsive (marges +8dp web).
- Focus actions prioritaires, minimal texte.

### Design Direction Principles

- **Épure Maximale** : <6 couleurs, pas de distractions, focus action principale.
- **Professionnalisme Africain** : Inspiré MTN MoMo, adapté soleil/terrain.
- **Cohérence Cross-Platform** : Même layouts, tokens partagés.
- **Évolutivité** : Base pour personnalisations futures sans rupture.

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## User Journeys

### Releveur Journey

**Journey Map** :
- **Phase 1: Préparation** : Ouverture app → sélection immeuble → liste compteurs triée (adresse/étage) → début relevé premier compteur.
- **Phase 2: Saisie Active** : Affichage compteur (photo cadran + numéro) → gros champ index auto-focus → saisie chiffres → prise photo (auto-déclenchement) → validation (tap/swipe) → feedback immédiat (vert + vibration OK, rouge + popup incohérent).
- **Phase 3: Progression** : Swipe horizontal pour compteur suivant → barre progression verte (X/48) → filtres rapides (non fait, incohérent) → auto-save local.
- **Phase 4: Fin Immeuble** : Dernier relevé validé → écran célébration (confettis + vibration longue) → bouton "Sync Immeuble" → progression sync (badge "X en attente" → vert "Envoyé").
- **Phase 5: Gestion Erreurs** : Si incohérent (index < précédent) → popup bloquant "Index trop bas – Expliquez" → champ remarque obligatoire → validation forcée photo/remarque.

**Pain Points Addressed** :
- **Stress Erreurs** : Validation anti-litige intégrée (alerte + remarque) → réduction anxiété.
- **Temps Terrain** : <20s/relevé moyen, offline complet → productivité maximale.
- **Fiabilité Réseau** : Sync background + manuelle → zéro blocage réseau.
- **Lisibilité Extérieur** : Dark mode high-contrast, gros texte → usage soleil direct.

**Success Metrics** :
- **Temps Moyen** : <15-20s/relevé (objectif 10-15s).
- **Taux Erreur** : <1% relevés incohérents (via contrôles intégrés).
- **Satisfaction** : NPS >+70 (fierté productive, sérénité confiante).

### Gestionnaire Journey

**Journey Map** :
- **Phase 1: Réception Données** : Notification "Nouveaux relevés immeuble X" → ouverture app → dashboard immeubles (progress bars vertes) → sélection immeuble → vue détails (liste relevés avec photos).
- **Phase 2: Validation** : Scan rapide photos (recadrage auto) → check incohérences (alertes rouges) → corrections manuelles si besoin (tap pour éditer) → validation globale (bouton "Approuver").
- **Phase 3: Génération Factures** : Bouton "Générer Factures" → calcul automatique (conso + tarif) → preview PDF → envoi groupé (SMS + email) → progression (badge "X envoyés").
- **Phase 4: Suivi** : Onglet "Historique" → stats mensuelles (conso moyenne, litiges) → notifications paiements reçus → export Excel pour compta.
- **Phase 5: Gestion Litiges** : Alerte "Litige relevé Y" → vue photo + remarque releveur → résolution (appel/tchat) → update facture.

**Pain Points Addressed** :
- **Corrections Manuelles** : Automatisation calculs + contrôles intégrés → temps économisé 80%.
- **Stress Litiges** : Photos + remarques intégrées → résolution rapide, confiance accrue.
- **Suivi Temps Réel** : Notifications + progress bars → contrôle permanent sans effort.
- **Export Comptable** : Bouton 1-click Excel → intégration facile avec outils existants.

**Success Metrics** :
- **Temps Validation** : <5min/immeuble (vs 30min manuel).
- **Taux Litiges** : <5% (vs 20-30% manuel).
- **Adoption** : 95% immeubles migrés en 3 mois.

### Locataire Journey

**Journey Map** :
- **Phase 1: Réception Facture** : SMS "Facture eau mois X : 15m³, 7500FCFA" + lien app → ouverture → authentification simple (PIN ou biometrics).
- **Phase 2: Consultation** : Dashboard personnel (conso graphique, historique) → détail facture (index relevé, photo compteur) → explication conso anormale si besoin.
- **Phase 3: Paiement** : Bouton "Payer Maintenant" → choix méthode (MTN MoMo, Orange Money) → confirmation rapide (PIN) → reçu instantané.
- **Phase 4: Historique** : Onglet "Historique" → graphiques conso mensuelle → comparaisons quartier → conseils économie eau.
- **Phase 5: Support** : Bouton "Contester" → formulaire simple (photo + remarque) → envoi → suivi status (en attente/résolu).

**Pain Points Addressed** :
- **Opacité Facturation** : Photos + index visibles → confiance, réduction contestations.
- **Paiement Complexe** : Intégration mobile money → paiement <30s.
- **Suivi Conso** : Graphiques simples → prise conscience, économies eau.
- **Support Réactif** : Formulaire + suivi → résolution rapide litiges.

**Success Metrics** :
- **Temps Paiement** : <1min moyen.
- **Taux Contestations** : <2% (vs 10-15% papier).
- **Satisfaction** : NPS >+60 (respect, sécurité).

### Cross-Journey Insights

- **Offline Robustness** : Tous journeys fonctionnent offline (sauf paiement locataire) → fiabilité africaine.
- **Feedback Loops** : Célébrations pour releveurs, confirmations pour gestionnaires, reçus pour locataires → émotions positives.
- **Data Flow Seamless** : Releveur → Gestionnaire → Locataire avec preuves intégrées → confiance chaîne complète.
- **Mobile-First** : Tous flows optimisés mobile, gestes larges, dark mode → usage terrain naturel.

## Component Strategy

### Design System Components

**Base MD3 utilisée :**
- Boutons (Button, FAB, IconButton)
- Champs de saisie (TextField, OutlinedTextField)
- Cartes (Card)
- Listes (ListItem)
- Barres de progression (LinearProgressIndicator)
- Icônes (Icon)
- Dialogues (AlertDialog)
- Chips (Chip)
- Badges (Badge)

### Custom Components

#### IndexInputField
**Objectif :** Saisie rapide et fiable des index de compteur
**Contenu :** Champ numérique énorme, label "Index actuel", hint "Saisissez les chiffres"
**Actions :** Saisie clavier, validation auto, clear
**États :** Vide (gris), rempli (vert), erreur (rouge avec message)
**Variantes :** Taille unique (80% écran)
**Accessibilité :** Label ARIA, focus auto, TalkBack support

#### PhotoCapture
**Objectif :** Capture photo compteur avec preview intégrée
**Contenu :** Bouton capture, preview image, bouton re-prendre
**Actions :** Tap capture, long-press preview, swipe recadrage
**États :** Prêt (bleu), capturant (gris), succès (vert), erreur (rouge)
**Variantes :** Avec/sans flash, mode portrait/paysage
**Accessibilité :** Bouton décrit, alt-text preview

#### SwipeNavigator
**Objectif :** Navigation fluide entre compteurs
**Contenu :** Indicateur position (X/Y), gestes hints
**Actions :** Swipe gauche/droite, tap position
**États :** Navigation active, début/fin atteint
**Variantes :** Horizontal/vertical, avec/sans pagination
**Accessibilité :** Swipe alternatif boutons, annonce position

#### SyncIndicator
**Objectif :** Feedback sync transparent
**Contenu :** Badge "X en attente", progress bar, icône cloud
**Actions :** Tap pour détails sync
**États :** Offline (gris), sync en cours (bleu), succès (vert), erreur (rouge)
**Variantes :** Petit/grand, avec/sans détails
**Accessibilité :** Badge annoncé, bouton détails décrit

#### CounterCard
**Objectif :** Affichage compteur avec statut
**Contenu :** Numéro logement, index actuel, photo miniature, statut
**Actions :** Tap pour saisie, long-press menu
**États :** Non fait (gris), fait (vert), incohérent (rouge)
**Variantes :** Compact/détaillé, avec/sans actions
**Accessibilité :** Contenu décrit, actions accessibles

#### CelebrationScreen
**Objectif :** Récompense accomplissement
**Contenu :** Message célébration, confettis animés, stats
**Actions :** Tap continuer, partager (optionnel)
**États :** Unique (succès)
**Variantes :** Immeuble terminé / sync réussi
**Accessibilité :** Animation réduite si préférences, contenu vocalisé

### Component Implementation Strategy

**Approche :**
- Construire personnalisés sur tokens MD3 (couleurs, spacing, typography)
- Cohérence patterns établis (ripple, elevation, states)
- Accessibilité WCAG AA+ intégrée
- Patterns réutilisables pour flows communs

**Stratégie Bibliothèque :**
- Composants core dans package partagé (@waterhouse/ui)
- Variants via props, pas duplication
- Tests Storybook pour visualisation
- Documentation auto-générée

### Implementation Roadmap

**Phase 1 - Core (Sprint 1-2) :**
- IndexInputField - cœur de l'app
- PhotoCapture - preuve anti-litige
- CounterCard - liste compteurs

**Phase 2 - Support (Sprint 3) :**
- SwipeNavigator - fluidité navigation
- SyncIndicator - feedback confiance
- CelebrationScreen - motivation

**Phase 3 - Enhancement (Sprint 4+) :**
- Variants responsive web
- Animations optimisées
- Intégrations avancées (Realm, Africa's Talking)

## UX Consistency Patterns

### Button Hierarchy

**Boutons Primaires :**
- Usage : Actions critiques (Valider index, Sync immeuble, Payer facture)
- Design : Pleine largeur, vert #4CAF50, 64dp hauteur, ripple animation
- Comportement : Feedback haptique (vibration courte), désactivé pendant traitement
- Accessibilité : Label clair, focus visible, TalkBack annonce action

**Boutons Secondaires :**
- Usage : Actions alternatives (Annuler, Détails, Re-prendre photo)
- Design : Contour gris, texte sombre, 48dp hauteur
- Comportement : Moins prominent, pas de vibration
- Accessibilité : Même exigences primaires

**Boutons Icône :**
- Usage : Actions contextuelles (Menu, Partager, Paramètres)
- Design : 48dp touch target, icône Material You, tooltip au long-press
- Comportement : Feedback subtil, états hover/press
- Accessibilité : Icône décrite, tooltip vocalisé

### Feedback Patterns

**Succès :**
- Usage : Actions réussies (index validé, sync terminé, paiement confirmé)
- Design : Fond vert #4CAF50, icône check, message court
- Comportement : Vibration longue (200ms), auto-disparition 3s, confettis pour célébrations
- Accessibilité : Annonce succès, vibration optionnelle

**Erreur :**
- Usage : Échecs critiques (index incohérent, réseau down, paiement refusé)
- Design : Fond rouge #EF5350, icône erreur, message explicatif + action corrective
- Comportement : Vibration double, popup bloquant, bouton "Réessayer"
- Accessibilité : Focus sur action corrective, message détaillé

**Avertissement :**
- Usage : Alertes non-bloquantes (conso anormale, remarque suggérée)
- Design : Fond jaune #FFEB3B, icône warning, message informatif
- Comportement : Toast discret, pas de vibration, auto-disparition 5s
- Accessibilité : Annonce avertissement, lecture message

**Info :**
- Usage : Informations générales (tips économie, status sync)
- Design : Fond bleu #42A5F5, icône info, message court
- Comportement : Toast subtil, pas de vibration
- Accessibilité : Annonce info, contenu lisible

### Form Patterns

**Saisie Index :**
- Usage : Entrée principale des données compteur
- Design : Champ 80% écran, police 48-60sp, clavier numérique auto
- Comportement : Auto-focus, validation temps réel (rouge si < précédent), hint dynamique
- Accessibilité : Label "Index actuel", annonce validation, focus maintenu

**Remarques Obligatoires :**
- Usage : Explication incohérences détectées
- Design : Textarea expansible, placeholder "Expliquez l'incohérence"
- Comportement : Bloquant si vide, compteur caractères, sauvegarde auto
- Accessibilité : Label obligatoire, annonce caractères restants

**Validation Globale :**
- Usage : Confirmation avant envoi
- Design : Liste points à vérifier (photo, remarque, index), bouton "Confirmer"
- Comportement : Check automatique, alerte si manquant
- Accessibilité : Liste lue, focus sur manquants

### Navigation Patterns

**Swipe Horizontal Compteurs :**
- Usage : Navigation séquentielle relevés
- Design : Indicateur X/Y, hints gestes, résistance début/fin
- Comportement : Vitesse adaptative, sauvegarde auto au changement
- Accessibilité : Boutons alternatif "Suivant/Précédent", annonce position

**Onglets Principaux :**
- Usage : Sections app (Relevés, Historique, Profil)
- Design : Bottom navigation, icônes + labels, badge notifications
- Comportement : Persistance sélection, transitions fluides
- Accessibilité : Tab order logique, labels clairs

**Navigation Immeubles :**
- Usage : Sélection immeuble à relever
- Design : Liste verticale, progress bar par immeuble
- Comportement : Tri par adresse, filtres rapides
- Accessibilité : Liste navigable, annonce statut

### Modal and Overlay Patterns

**Dialogues Confirmation :**
- Usage : Actions irréversibles (sync, envoi factures)
- Design : Titre + message, boutons "Annuler/Confirmer"
- Comportement : Bloquant, focus sur "Annuler" par défaut
- Accessibilité : Rôles ARIA corrects, navigation clavier

**Previews Photo :**
- Usage : Vérification capture compteur
- Design : Overlay plein écran, contrôles zoom/recadrage
- Comportement : Swipe fermer, boutons "Garder/Re-prendre"
- Accessibilité : Alt-text, gestes alternatifs

**Popups Erreur :**
- Usage : Erreurs bloquantes (réseau, permissions)
- Design : Modal centré, icône + message + bouton action
- Comportement : Pas de fermeture accidentelle, retry automatique
- Accessibilité : Focus piégé, annonce priorité haute

### Empty States and Loading States

**État Vide :**
- Usage : Pas de compteurs à relever, historique vide
- Design : Illustration + message encourageant, CTA primaire
- Comportement : Animation subtile, guide vers action
- Accessibilité : Message descriptif, CTA accessible

**Chargement :**
- Usage : Sync en cours, traitement photo
- Design : Progress bar + message "X en cours", spinner
- Comportement : Non-interruptible, feedback détaillé
- Accessibilité : Annonce progression, message alternatif

### Search and Filtering Patterns

**Filtres Compteurs :**
- Usage : Tri liste (non fait, incohérent, par étage)
- Design : Chips empilables, icônes intuitives
- Comportement : Appliqués instantanément, badge compteurs filtrés
- Accessibilité : Chips navigables, annonce résultats

**Recherche Globale :**
- Usage : Trouver immeuble/compteur spécifique
- Design : Barre search top, suggestions auto
- Comportement : Résultats temps réel, historique recherches
- Accessibilité : Autocomplete annoncé, résultats listés

### Design System Integration

**Cohérence MD3 :**
- Tokens couleurs (vert succès, rouge erreur) appliqués
- Spacing 8dp grid respecté
- Elevation et states standardisés
- Components patterns intégrés

**Personnalisations WaterHouse :**
- Dark mode forcé pour lisibilité extérieure
- Touch targets 48dp+ pour gestes larges
- Feedback haptique systématique
- Patterns offline-first (queue sync visible)

## Responsive Design & Accessibility

### Responsive Strategy

**Mobile-First Absolu (320-600px) :**
- Layouts verticaux empilés, 1 colonne max
- Touch targets 48-64dp, gestes larges (swipe 20% écran)
- Texte 16-60sp, espacement 16-24dp
- Navigation bottom tabs, modales overlay

**Tablet Adaptation (600-1024px) :**
- Layouts 2 colonnes (liste + détail), marges +8dp
- Touch targets maintenus 48dp+, gestes swipe conservés
- Texte/tailles relatives identiques, density +20%
- Navigation side drawer optionnel

**Desktop Gestionnaire (1024+px) :**
- Layouts 3 colonnes (navigation + contenu + actions)
- Souris/clavier first, touch targets 44dp+ (WCAG)
- Multi-fenêtrage (dashboard + détails simultanés)
- Navigation top/side, raccourcis clavier

**Stratégie Cross-Device :**
- Composants adaptatifs (flex layouts, media queries)
- Images responsives (compression auto)
- Gestes unifiés (swipe navigation partout)
- Dark mode obligatoire tous devices

### Breakpoint Strategy

**Breakpoints Personnalisés :**
- **Petit Mobile** : 320-480px (écrans très petits, Cameroun)
- **Mobile Standard** : 481-767px (majorité Android)
- **Tablet** : 768-1023px (gestionnaire tablette)
- **Desktop** : 1024+px (bureau gestionnaire)

**Logique Adaptation :**
- Mobile-first : Design baseline mobile, enhancements progressives
- Content-first : Priorité contenu critique, puis enhancements
- Performance-first : Breakpoints influencent asset loading (images compressées mobile)

**Règles Breakpoints :**
- Layouts changent à 768px (mobile→tablet) et 1024px (tablet→desktop)
- Composants s'adaptent fluide entre breakpoints
- Tests sur appareils réels chaque breakpoint

### Accessibility Strategy

**Niveau Conformité : WCAG 2.1 AA**
- **A (Essentiel)** : Navigation clavier, labels texte, médias alternatifs
- **AA (Standard)** : Contrast 4.5:1, touch targets 44x44px, focus visible, lang attribute

**Considérations Spécifiques WaterHouse :**
- **TalkBack Android** : Labels ARIA français, annonces contextuelles, gestes alternatifs
- **Daltonisme** : Patterns non-couleur (icônes + texte), contrast élevé
- **Motricité Réduite** : Touch targets 48dp+, gestes simples, temps généreux
- **Vision Réduite** : Zoom 200% supporté, texte 16sp minimum
- **Terrain Africain** : Usage extérieur (soleil), batteries limitées, réseaux instables

**Fonctionnalités Accessibilité :**
- Mode high contrast forcé dark
- Réduction motion (confettis optionnel)
- Voice guidance pour saisie index
- Skip links web, focus management

### Testing Strategy

**Tests Responsive :**
- **Appareils Réels** : Tecno Spark 8 (5.5"), Infinix Hot 10 (6.5"), Samsung Tab A8
- **Navigateurs** : Chrome Android, Firefox, Safari iOS (compatibilité web)
- **Réseaux** : Tests 2G/3G simulés, offline complet
- **Performance** : Lighthouse scores >90 mobile/desktop

**Tests Accessibilité :**
- **Automatisés** : axe-core, WAVE, Lighthouse accessibility
- **Screen Readers** : TalkBack (Android), VoiceOver (iOS), NVDA (web)
- **Clavier** : Navigation full keyboard web, gestes alternatifs mobile
- **Couleurs** : Simulation daltonisme (Color Oracle), contrast checker
- **Utilisateurs** : Tests avec releveurs peu techniciens, personnes handicapées

**Tests Utilisateur :**
- **Inclusivité** : 5-10% panel utilisateurs handicapés
- **Terrain Réel** : Tests extérieurs soleil/vent Cameroun
- **Performance** : Mesure temps tâches, taux erreurs, satisfaction

### Implementation Guidelines

**Développement Responsive :**
- **Units Relatives** : rem/em pour texte, %/vw pour layouts, dp pour mobile
- **Media Queries** : Mobile-first (min-width), container queries composants
- **Images** : Formats modernes (WebP), compression auto, lazy loading
- **Performance** : Bundle splitting, code splitting par breakpoint

**Développement Accessibilité :**
- **HTML Sémantique** : Headings hierarchy, landmarks, form labels
- **ARIA** : Labels descriptifs, live regions feedback, roles modales
- **Focus** : Indicateurs visibles, ordre logique, skip links
- **Couleurs** : Variables CSS contrast, mode high contrast
- **Tests** : ESLint a11y, Storybook axe, tests e2e accessibilité

**Guidelines Équipe :**
- Reviews accessibilité chaque PR
- Formation équipe WCAG basics
- Outils : axe DevTools, WAVE toolbar, Color Contrast Analyzer
- Métriques : Lighthouse accessibility score >95, zero violations critiques