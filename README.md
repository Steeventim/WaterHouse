# WaterHouse

## Génération des factures PDF

La génération PDF côté mobile s'appuie sur les services suivants :

- `InvoicePdfService` : construit le template HTML de facture.
- `InvoicePdfStorageService` : stocke le document localement et génère un lien temporaire.
- `InvoiceGenerationService` : orchestre la génération et l'enregistrement.

Flux recommandé : calcul consommation → création facture → génération PDF → lien temporaire.
