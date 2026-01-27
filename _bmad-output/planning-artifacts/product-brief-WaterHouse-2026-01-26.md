---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: ["Application Relevé Compteurs .md"]
date: 2026-01-26
author: Tims_team
---

# Product Brief: WaterHouse

## Résumé Exécutif

WaterHouse vise à révolutionner la gestion locative en Afrique francophone en remplaçant les processus manuels de relevé des compteurs d'eau et de facturation par une solution mobile intuitive et fiable. En permettant des relevés sécurisés avec photos, des calculs automatiques conformes aux tarifs locaux, et l'envoi instantané de factures par SMS ou email, l'application élimine les erreurs, réduit les litiges et améliore la traçabilité. Cela se traduit par des économies de temps et d'argent pour les gestionnaires, une meilleure expérience pour les locataires, et une image professionnelle renforcée.

---

## Vision Centrale

### Énoncé du Problème

Dans la gestion locative, la facturation de l'eau repose sur des processus manuels (relevés papier, calculs Excel, distribution physique), générant des erreurs de saisie, des litiges fréquents, des pertes de temps importantes et une image peu professionnelle. Les gestionnaires perdent des jours par mois sur des tâches répétitives, risquent des impayés dus à des contestations, et manquent de traçabilité fiable.

### Impact du Problème

Les conséquences sont concrètes : pertes financières (erreurs de calcul, impayés accumulés), dégradation de la confiance locataire-gestionnaire, coûts cachés (impression, déplacements, relances manuelles), et un manque de professionnalisme perçu. Sans solution, les litiges s'accumulent, les retards de paiement augmentent, et l'efficacité globale de la gestion locative diminue.

### Pourquoi les Solutions Existantes Sont Insuffisantes

Les méthodes actuelles (papier, Excel, appels téléphoniques) sont lentes, sujettes à erreurs et non traçables. Elles ne fournissent pas de preuves visuelles, ne permettent pas d'envoi instantané, et ne gèrent pas efficacement les relances ou les audits. Les solutions numériques existantes sont souvent trop complexes, coûteuses ou inadaptées aux contextes africains (réseau instable, priorisation SMS).

### Solution Proposée

WaterHouse est une application mobile simple pour releveurs, couplée à un backend web pour gestionnaires. Les releveurs saisissent les index avec photos de preuve, l'app calcule automatiquement les factures selon les tarifs personnalisables, et envoie les factures par SMS (avec lien PDF) ou email. L'historique complet (relevés, photos, paiements) assure une traçabilité irréprochable, avec suivi des impayés et relances automatisées.

### Différenciateurs Clés

- **Simplicité et Accessibilité** : Interface mobile intuitive, adaptée aux releveurs non-techniciens, avec mode offline pour zones à faible réseau.
- **Priorisation SMS** : Envoi prioritaire par SMS (fiable en Afrique), avec email en complément, réduisant les coûts et améliorant la réception.
- **Traçabilité Complète** : Photos horodatées, logs d'envoi, historique des paiements – preuve irréfutable en cas de litige.
- **Adaptation Locale** : Tarifs personnalisables (forfaits, tranches progressives, taxes), conformes aux réglementations camerounaises et africaines.
- **Efficacité Opérationnelle** : Réduction drastique du temps (de jours à minutes), élimination des erreurs manuelles, suivi automatisé des paiements.

## Utilisateurs Cibles

### Utilisateurs Primaires

#### Releveur / Agent Terrain (Gardien, Technicien)

**Contexte et Profil :** Agent de terrain, souvent gardien ou technicien local, travaillant pour un ou plusieurs immeubles. Utilise un smartphone Android bas de gamme, motivé par la simplicité et la rapidité pour éviter les erreurs et les contestations.

**Expérience du Problème :** Perd du temps sur des relevés papier sujets à erreurs (chiffres mal lus, oublis), sans preuves visuelles, ce qui génère des litiges avec les locataires. Frustration due aux réseaux instables et à l'absence d'outils modernes.

**Vision du Succès :** Saisie ultra-rapide avec photo preuve, alertes anti-erreur (index inférieur au précédent), mode hors-ligne, et liste triée par immeuble. Dirait : "C'est enfin simple et professionnel, plus de disputes inutiles !"

#### Gestionnaire / Propriétaire Principal

**Contexte et Profil :** Propriétaire individuel ou gestionnaire d'immeubles (1 à 30 logements), souvent familial ou semi-professionnel. Bon niveau technique, utilise régulièrement des outils web ou mobiles pour superviser.

**Expérience du Problème :** Passe des jours par mois sur calculs Excel erronés, impression/distribution physique, relances manuelles d'impayés. Risque financier élevé, image peu professionnelle, manque de traçabilité.

**Vision du Succès :** Dashboard global pour valider relevés, générer/envoyer factures automatiquement, suivre paiements et impayés, configurer tarifs personnalisables. Dirait : "Enfin, je récupère 80 % de mon temps et mes locataires paient plus vite !"

### Utilisateurs Secondaires

#### Locataire

**Contexte et Profil :** Résident d'un logement locatif, souvent urbain en Afrique francophone. Utilise principalement SMS/WhatsApp, motivé par la transparence et la rapidité.

**Expérience du Problème :** Reçoit des factures tardives, peu claires, parfois erronées, sans preuves d'index. Disputes fréquentes sur les montants, retards de paiement dus à des relances manuelles.

**Vision du Succès :** Facture claire par SMS avec lien PDF sécurisé, historique de consommation consultable, preuve visuelle des relevés. Dirait : "C'est transparent et rapide, plus de surprises désagréables !"

#### Comptable / Assistant Externe

**Contexte et Profil :** Comptable ou assistant travaillant pour des propriétaires/gestionnaires, bon niveau technique, utilise des outils de comptabilité.

**Expérience du Problème :** Doit vérifier manuellement des factures Excel mal structurées, sans historique fiable, ce qui complique les audits et la comptabilité générale.

**Vision du Succès :** Exports structurés (CSV/Excel), historique complet filtrable par période/immeuble. Dirait : "Enfin, des données fiables et prêtes pour la compta !"

### Parcours Utilisateur

**Découverte :** Les gestionnaires découvrent WaterHouse via recommandations locales ou agences immobilières ; les releveurs sont formés par leur employeur.

**Intégration :** Formation rapide (vidéo 5-10 min) pour releveurs ; configuration initiale des tarifs et immeubles pour gestionnaires.

**Utilisation Courante :** Releveurs saisissent index avec photos en mode offline ; gestionnaires valident, génèrent factures et suivent paiements via dashboard.

**Moment de Succès :** Quand un relevé contesté est résolu instantanément grâce à la photo preuve, ou quand les impayés diminuent grâce aux relances automatisées.

**À Long Terme :** Devient routine : relevés mensuels sans effort, suivi automatisé des paiements, exports comptables faciles.

## Métriques de Succès

### Signaux de Succès Utilisateur

Nous saurons que WaterHouse réussit quand les utilisateurs expriment une transformation positive de leur quotidien, soutenue par des données objectives.

**Signaux Qualitatifs :**

- Releveurs : « Je mets 2-3 minutes par compteur au lieu de 10, et je n'ai plus peur des contestations grâce aux photos. »
- Gestionnaires : « Je passe de 3-4 jours par mois à 2-3 heures pour tout le cycle relevé → facturation → envoi. »
- Phrases gagnantes : « Ça valait vraiment le coup », « Je ne pourrais plus revenir en arrière », « Mes locataires reçoivent enfin des factures claires et rapides ».

**Signaux Quantitatifs :**

- Adoption : >70-80 % des relevés mensuels effectués via l'app.
- Rétention : Taux d'utilisation mensuel >85 % après 3 mois.
- NPS : > +40 auprès des gestionnaires/releveurs après 3-6 mois.

### Objectifs Business

Les objectifs business se concentrent sur la création de valeur mesurable : réduction du temps, amélioration du recouvrement, diminution des litiges et professionnalisation.

- **Gain de Temps :** Réduction drastique du temps total (releveurs : 50-70 % ; gestionnaires : 80-90 %).
- **Amélioration du Recouvrement :** Augmentation du taux de paiement à temps (+15-40 points) et réduction des impayés >30 jours (≥30-50 %).
- **Réduction des Litiges :** Diminution des contestations (≥50-70 %) grâce à la traçabilité.
- **Professionnalisation :** Image améliorée et satisfaction élevée (NPS >+50, CSAT >4/5).

### Indicateurs Clés de Performance (KPI)

Voici les KPI prioritaires, classés par catégorie :

| Catégorie           | Métrique / KPI Clé                        | Objectif MVP (3-6 mois) | Objectif Mature (12+ mois) | Pourquoi Important ?          | Comment Mesurer ?         |
| ------------------- | ----------------------------------------- | ----------------------- | -------------------------- | ----------------------------- | ------------------------- |
| Adoption & Usage    | Taux de relevés via l'app                 | >60-70%                 | >90%                       | Prouve abandon du manuel      | % relevés dans l'app      |
| Adoption & Usage    | Nombre moyen de relevés par releveur/mois | ≥ nombre compteurs      | Stable/croissance          | Utilisation systématique      | Logs app                  |
| Efficacité Temps    | Temps moyen par relevé                    | <3-4 min                | <2 min                     | Gain direct pour releveurs    | Timestamp saisie          |
| Efficacité Temps    | Temps total cycle facturation             | Réduction ≥50-70%       | ≥80-90%                    | Gain principal gestionnaires  | Enquêtes + estimation     |
| Qualité & Fiabilité | Taux contestations litiges                | Réduction ≥50-70%       | <5%                        | Preuve photo réduit disputes  | Nombre litiges / factures |
| Qualité & Fiabilité | Taux erreur saisie détectée               | >90%                    | >98%                       | Contrôles anti-erreur         | Logs alertes              |
| Valeur Économique   | Taux recouvrement (15j)                   | +15-25 points           | +30-40 points              | Paiements plus rapides        | % factures payées         |
| Valeur Économique   | Taux impayés >30j                         | Réduction ≥30-50%       | <10%                       | Relances automatiques         | Suivi statut              |
| Satisfaction        | NPS (gestionnaires + releveurs)           | >+30                    | >+50                       | Indicateur « valait le coup » | Enquête in-app/WhatsApp   |
| Satisfaction        | CSAT post-envoi (locataires)              | >4/5                    | >4.5/5                     | Locataires satisfaits         | Lien mini-enquête SMS     |
| Opérationnel        | Taux envoi SMS réussi                     | >98%                    | >99.5%                     | Fiabilité critique            | Logs fournisseur          |
| Opérationnel        | Taux synchronisation réussie              | >95%                    | >99%                       | Mode hors-ligne essentiel     | Logs sync                 |

**KPI North Star :** Temps économisé par mois pour le gestionnaire + % factures payées dans les délais – combo capturant valeur business (temps = argent + cashflow).

**Suivi Recommandé :**

- Dashboard interne (PostgreSQL + Metabase).
- Enquêtes courtes tous les 1-3 mois.
- Interviews 1:1 avec 5-10 utilisateurs clés à 3 et 6 mois.

## Périmètre MVP

### Fonctionnalités Centrales

**Application Mobile (Android Prioritaire) :**

- Authentification simple (téléphone + code OTP SMS ou email/mot de passe).
- Liste des logements/compteurs assignés au releveur.
- Écran de saisie relevé : numéro compteur/logement, index précédent visible, champ index actuel (gros, numérique), alerte bloquante si index < précédent (avec option forcer + remarque), bouton photo obligatoire, bouton "Valider & suivant".
- Mode hors-ligne complet : saisie sans réseau, sync auto/manuel.

**Backend Minimal :**

- Stockage relevés (avec photo, horodatage, releveur).
- Calcul automatique consommation/facture (formule configurable : conso × tarif + taxes).
- Génération PDF facture simple (période, index préc./actuel, conso m³, montant TTC).
- Envoi par SMS message court + lien sécurisé vers PDF hébergé.

**Interface Web Ultra-Basique :**

- Ajouter/éditer immeubles, logements, compteurs, locataires (nom + numéro téléphone).
- Lancer génération/envoi groupé factures après relevés.
- Voir liste factures envoyées/statut.

### Hors Périmètre pour MVP

- App mobile pour locataire (pas d'authentification locataire).
- Paiement intégré (mobile money).
- Relances automatiques impayés.
- Multi-tarifs complexes par immeuble.
- Exports Excel avancés.
- Dashboard analytics détaillé.
- Notifications push.
- Version iOS (Android suffit).
- Gestion multi-gestionnaires/rôles fins.

### Critères de Succès MVP

**Seuils de Satisfaction par Profil :**

- Releveur : Saisie rapide offline + sync facile, alerte index incohérent, photo obligatoire, <3 min/compteur → « Je n'ai plus peur des erreurs ni des disputes, et je finis en moitié moins de temps. »
- Gestionnaire : Calcul auto + génération PDF fiable, envoi groupé SMS, visibilité relevés, moins de litiges → « Je passe de 3 jours à 3 heures par mois, et les locataires paient plus vite. »
- Locataire : Réception SMS le jour/lendemain, facture claire avec index/conso/montant, lien PDF rapide → « Pour la première fois, je reçois ma facture d'eau le jour même et je comprends tout. »

**Validation Pilote :** Après 1-2 cycles mensuels, si >70 % des utilisateurs disent « ça vaut le coup » → MVP réussi.

### Vision Future

**Approche Équilibrée :** Build → Measure → Learn avec focus vitesse feedback. Utiliser outils no-code/low-code (Supabase/Firebase) pour accélérer.

**Périmètre MVP en 3 Niveaux :**

- Niveau 1 (1-2 mois) : Relevé + saisie + photo + sync + calcul simple + PDF local + envoi manuel (WhatsApp).
- Niveau 2 (3-4 mois) : Envoi auto SMS + interface web basique.
- Niveau 3 (5+ mois) : Relances, paiements, analytics.

**Timeline Réaliste :**

- Mois 1-2 : MVP Niveau 1 + pilote 1 immeuble/20-50 compteurs.
- Mois 3 : Feedback → MVP Niveau 2 → extension 3-5 immeubles.
- Mois 4-6 : Stabilisation + itérations basées retours.

**Évolutions Long Terme :** Relances auto, paiements intégrés, multi-tarifs, exports avancés, version iOS, gestion multi-gestionnaires, analytics détaillés, notifications push.
