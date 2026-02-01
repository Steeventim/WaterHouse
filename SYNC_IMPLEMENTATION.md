# Synchronisation des Données de Base - Story 2.1

## Vue d'ensemble

Cette story implémente la synchronisation automatique des données de base (immeubles, logements, compteurs) entre le serveur API et l'application mobile WaterHouse. Elle permet aux releveurs de travailler offline avec les données les plus récentes.

## Fonctionnalités implémentées

### Backend (API REST)

#### Endpoints

**GET `/api/v1/catalog/sync`**

- Récupère les données de catalogue synchronisées pour un utilisateur
- Paramètres de requête :
  - `userId` : ID de l'utilisateur
  - `lastSync` : Timestamp ISO du dernier sync (optionnel, pour sync incrémental)
- Répond avec `CatalogSyncData` contenant buildings, apartments, meters et timestamp

**GET `/api/v1/catalog/user-assignments`**

- Récupère les immeubles et logements assignés à un utilisateur
- Paramètres: `userId`

**POST `/api/v1/catalog/user-assignments`**

- Crée des assignations pour un utilisateur
- Body: `{ userId, buildingIds?, apartmentIds?, assignedBy? }`

**DELETE `/api/v1/catalog/user-assignments`**

- Supprime les assignations d'un utilisateur
- Body: `{ userId, buildingIds?, apartmentIds? }`

**Endpoints CRUD Meters**

- `GET /api/v1/catalog/meters` - Lister tous les compteurs
- `GET /api/v1/catalog/meters/:id` - Détails d'un compteur
- `POST /api/v1/catalog/meters` - Créer un compteur
- `PUT /api/v1/catalog/meters/:id` - Modifier un compteur
- `DELETE /api/v1/catalog/meters/:id` - Désactiver un compteur

#### Service Backend

Le `CatalogService` gère :

- Filtrage des données par user assignments
- Support du sync incrémental via `lastSync`
- Agrégation des données de catalogue
- Gestion des assignations utilisateur

### Mobile (React Native)

#### Services

**NetworkMonitor**

- Surveille l'état de la connectivité réseau
- Notifie les observateurs lors des changements d'état
- Méthodes principales :
  - `initialize()` : Init le monitoring
  - `isOnline()` : Vérifier l'état courant
  - `onNetworkAvailable(callback)` : Callback quand le réseau devient disponible
  - `onNetworkLost(callback)` : Callback quand le réseau est perdu

**LocalStorage**

- Gère le stockage SQLite local des données de catalogue
- Opérations :
  - `initialize()` : Créer les tables SQLite
  - `storeCatalogData(data)` : Stocker les données synchronisées
  - `getLastSyncTimestamp()` : Récupérer le dernier sync
  - `getAllBuildings()`, `getAllApartments()`, `getAllMeters()` : Lire les données
  - `clearAll()` : Effacer toutes les données

**ApiClient**

- Client HTTP pour communiquer avec l'API
- Gère les erreurs réseau et les tokens d'authentification
- Méthodes :
  - `getCatalogSync(params)` : Récupérer les données de sync
  - `getUserAssignments(userId)` : Récupérer les assignations
  - `setAuthToken(token)` : Définir le token JWT

**SyncManager**

- Orchestre la synchronisation complète
- Caractéristiques :
  - Sync automatique au démarrage de l'app
  - Sync périodique toutes les 15 minutes (quand online)
  - Sync manuel sur demande
  - Callbacks de progression
  - Gestion des erreurs et retry

#### Composant UI

**SyncStatus**

- Affiche l'état de synchronisation
- Modes :
  - Détaillé : Affiche état, dernier sync, bouton de sync manuel
  - Compact : Indicateur d'état minimal
- États :
  - ✅ Synchronisé (vert)
  - 🔄 Synchronisation... (bleu)
  - ⚠️ Hors ligne (rouge)

#### Hook React

**useSync**

- Hook pour intégrer le SyncManager dans les composants
- Retourne :
  - `syncProgress` : État courant de sync
  - `isInitialized` : Si le manager est prêt
  - `performSync()` : Fonction pour lancer un sync manuel

## Architecture et Design

### Flux de synchronisation

```
App Start
  ↓
Initialiser NetworkMonitor
  ↓
Vérifier connectivité
  ↓
Obtenir userId et lastSync
  ↓
Appeler API /sync
  ↓
Stocker données en SQLite
  ↓
Démarrer sync périodique (15 min)
  ↓
Notifier les observateurs
```

### Gestion du mode offline

- Les données synchronisées sont stockées en SQLite
- L'app fonctionne 100% offline avec les données locales
- Lors du retour online :
  - Sync automatique démarre
  - Nouvelles données remplacent les anciennes
  - Notifications de progression

### Performance

- Sync complète < 10 secondes par MB (REQ-PERF-003)
- Stockage local optimisé avec indexes
- Requêtes paramétrées pour éviter les injections
- Gestion efficace de la mémoire avec fermeture de transactions

## Tests

### Unit Tests

- **NetworkMonitor.spec.ts** : Monitoring d'état réseau
- **LocalStorage.spec.ts** : Opérations SQLite
- **ApiClient.spec.ts** : Communication HTTP
- **SyncManager.spec.ts** : Orchestration de sync
- **SyncStatus.spec.tsx** : Composant UI
- **CatalogService.spec.ts** : Backend service
- **CatalogController.spec.ts** : API endpoints

### Integration Tests

- **catalog.integration.spec.ts** : Workflow complet de sync
  - Sync offline handling
  - Incremental sync
  - Progress tracking
  - Network transitions

### Coverage

Objectif : > 90% de couverture de code pour tous les composants sync

## Dépendances

### Backend

- `@nestjs/typeorm` - ORM
- `typeorm` - Requêtes BD

### Mobile

- `@react-native-community/netinfo` - Monitoring réseau
- `react-native-sqlite-storage` - Stockage local
- `@react-native-async-storage/async-storage` - Metadata
- `axios` - Client HTTP

## Utilisation

### Dans l'API

```typescript
// Initialiser le module
import { CatalogModule } from './modules/catalog/catalog.module';

@Module({
  imports: [CatalogModule],
})
export class AppModule {}

// Utiliser le service
constructor(private catalogService: CatalogService) {}

const syncData = await this.catalogService.syncCatalog({
  userId: 'user_123',
  lastSync: '2026-01-26T00:00:00Z',
});
```

### Dans l'app mobile

```typescript
// Initialiser le SyncManager
const apiClient = new ApiClient({ baseURL: 'http://api.example.com' });
const localStorage = new LocalStorage();
const networkMonitor = new NetworkMonitor();
const syncManager = new SyncManager(apiClient, localStorage, networkMonitor);

await syncManager.initialize();

// Utiliser le hook dans les composants
export const MyComponent = () => {
  const { syncProgress, performSync } = useSync(syncManager);

  return (
    <SyncStatus
      syncProgress={syncProgress}
      onManualSync={performSync}
    />
  );
};
```

## Considérations futures

- Sync incrémental optimisé avec delta updates
- Compression des données pour réduire la bande passante
- Gestion de conflits de données (rare mais possible)
- Partitioning de données pour les grandes installations
- Métriques et monitoring de sync
- Batch operations pour meilleure performance
- Support du cache invalidation

## Critères de succès

✅ Sync automatique au démarrage de l'app
✅ Toutes les données assignées disponibles offline
✅ Sync manuel possible par l'utilisateur
✅ Sync complète < 10s/MB
✅ 100% d'availability offline
✅ Tests > 90% couverture
✅ Gestion robuste des erreurs
✅ UX fluide pendant les syncs
