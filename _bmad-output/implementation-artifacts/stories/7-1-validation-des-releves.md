# Story 7-1: Validation des Relevés

## Story Header
- **Story ID**: 7-1
- **Key**: WH-7-1
- **Epic**: Epic 7 - Interface Web de Gestion
- **Title**: Validation des Relevés
- **Status**: Ready for Dev
- **Assignee**: TBD
- **Created Date**: 2026-01-26
- **Updated Date**: 2026-01-26
- **Story Points**: 8

## User Story
En tant que **gestionnaire d'immeuble**, je veux **valider les relevés de compteurs soumis par les releveurs** afin que **je puisse m'assurer de l'exactitude des données avant facturation**.

En tant que **gestionnaire d'immeuble**, je veux **rejeter les relevés avec anomalies** afin que **les releveurs puissent les corriger**.

## Acceptance Criteria
### Fonctionnel
- [ ] Liste des relevés en attente de validation
- [ ] Visualisation des photos de relevés
- [ ] Comparaison avec relevés précédents
- [ ] Validation/rejet avec commentaires
- [ ] Notifications aux releveurs des décisions
- [ ] Historique des validations/rejets
- [ ] Filtres par immeuble, période, statut

### Non-Fonctionnel
- [ ] Interface responsive (desktop + mobile)
- [ ] Temps de chargement < 2 secondes
- [ ] Support des formats image courants
- [ ] Audit trail complet des actions

## Technical Requirements

### Architecture Context
- **Bounded Context**: Management & Validation
- **Integration Points**: Reading Service, File Storage, Notification Service
- **Security**: Authentification gestionnaire, autorisation par immeuble
- **Performance**: Pagination, lazy loading images

### API Endpoints

#### Backend (NestJS)
```typescript
// Liste relevés en attente
GET /api/management/readings/pending-validation
Authorization: Bearer {manager-token}
Query: ?buildingId={id}&page={number}&limit={number}&status={pending|validated|rejected}

// Détails d'un relevé
GET /api/management/readings/{id}
Authorization: Bearer {manager-token}

// Validation/rejet d'un relevé
PUT /api/management/readings/{id}/validate
Authorization: Bearer {manager-token}
Content-Type: application/json

{
  "action": "validate|reject",
  "comments": "Commentaires optionnels",
  "correctedValue": 12345 // Optionnel pour correction
}

// Historique des relevés
GET /api/management/readings/history
Authorization: Bearer {manager-token}
Query: ?buildingId={id}&dateFrom={date}&dateTo={date}&status={all|validated|rejected}

// Métriques de validation
GET /api/management/readings/validation-metrics
Authorization: Bearer {manager-token}
Query: ?buildingId={id}&period={month|quarter|year}
```

### Database Schema

#### Extension de readings
```sql
-- Ajout de colonnes pour validation
ALTER TABLE readings ADD COLUMN validation_status VARCHAR(20) DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected'));
ALTER TABLE readings ADD COLUMN validated_at TIMESTAMP;
ALTER TABLE readings ADD COLUMN validated_by UUID REFERENCES users(id);
ALTER TABLE readings ADD COLUMN validation_comments TEXT;
ALTER TABLE readings ADD COLUMN corrected_value INTEGER;
ALTER TABLE readings ADD COLUMN rejection_reason VARCHAR(100);
```

#### Table: reading_validation_history
```sql
CREATE TABLE reading_validation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reading_id UUID REFERENCES readings(id) ON DELETE CASCADE,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  changed_by UUID REFERENCES users(id),
  change_reason TEXT,
  corrected_value INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_validation_history_reading ON reading_validation_history(reading_id);
CREATE INDEX idx_validation_history_changed_by ON reading_validation_history(changed_by);
CREATE INDEX idx_validation_history_created_at ON reading_validation_history(created_at);
```

### Web Implementation (React)

#### Composant Liste Relevés en Attente
```typescript
// src/components/management/ReadingValidationList.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Card, Text, Chip, Button, Avatar, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

interface Reading {
  id: string;
  meterId: string;
  currentValue: number;
  previousValue: number;
  consumption: number;
  photoUrl: string;
  submittedAt: string;
  submittedBy: string;
  buildingName: string;
  apartmentNumber: string;
  validationStatus: 'pending' | 'validated' | 'rejected';
}

export const ReadingValidationList: React.FC = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    loadPendingReadings();
  }, [searchQuery]);

  const loadPendingReadings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/management/readings/pending-validation', {
        params: { search: searchQuery }
      });
      setReadings(response.data);
    } catch (error) {
      console.error('Failed to load readings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'validated': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'validated': return 'Validé';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const renderReadingItem = ({ item }: { item: Reading }) => (
    <Card style={styles.readingCard} onPress={() => navigateToDetail(item)}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.buildingInfo}>
            <Text style={styles.buildingName}>{item.buildingName}</Text>
            <Text style={styles.apartment}>Appartement {item.apartmentNumber}</Text>
          </View>
          <Chip 
            mode="outlined" 
            textStyle={{ color: getStatusColor(item.validationStatus) }}
          >
            {getStatusText(item.validationStatus)}
          </Chip>
        </View>

        <View style={styles.meterInfo}>
          <Text style={styles.meterId}>Compteur: {item.meterId}</Text>
          <Text style={styles.values}>
            Précédent: {item.previousValue} → Actuel: {item.currentValue}
          </Text>
          <Text style={styles.consumption}>
            Consommation: {item.consumption} m³
          </Text>
        </View>

        <View style={styles.submissionInfo}>
          <Text style={styles.submittedBy}>Par: {item.submittedBy}</Text>
          <Text style={styles.submittedAt}>
            {new Date(item.submittedAt).toLocaleDateString('fr-FR')}
          </Text>
        </View>

        {item.photoUrl && (
          <View style={styles.photoIndicator}>
            <Avatar.Icon size={24} icon="camera" />
            <Text style={styles.photoText}>Photo disponible</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  const navigateToDetail = (reading: Reading) => {
    navigation.navigate('ReadingValidationDetail', { readingId: reading.id });
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Rechercher par immeuble ou appartement..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={readings}
        keyExtractor={(item) => item.id}
        renderItem={renderReadingItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadPendingReadings} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun relevé en attente de validation</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  searchBar: { margin: 16, elevation: 2 },
  readingCard: { 
    marginHorizontal: 16, 
    marginVertical: 8,
    elevation: 2
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start',
    marginBottom: 12
  },
  buildingInfo: { flex: 1 },
  buildingName: { fontSize: 16, fontWeight: 'bold' },
  apartment: { fontSize: 14, color: 'gray' },
  meterInfo: { marginBottom: 12 },
  meterId: { fontSize: 14, fontWeight: '500' },
  values: { fontSize: 14, marginTop: 4 },
  consumption: { fontSize: 14, color: '#1976d2', fontWeight: '500' },
  submissionInfo: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 8
  },
  submittedBy: { fontSize: 12, color: 'gray' },
  submittedAt: { fontSize: 12, color: 'gray' },
  photoIndicator: { 
    flexDirection: 'row', 
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 8,
    borderRadius: 4
  },
  photoText: { fontSize: 12, marginLeft: 8, color: '#1976d2' },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 32
  },
  emptyText: { fontSize: 16, color: 'gray', textAlign: 'center' }
});
```

#### Composant Détail et Validation
```typescript
// src/components/management/ReadingValidationDetail.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Button, TextInput, Avatar } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { api } from '../../services/api';

type ReadingDetailRouteProp = RouteProp<{ ReadingValidationDetail: { readingId: string } }, 'ReadingValidationDetail'>;

interface Props {
  route: ReadingDetailRouteProp;
}

export const ReadingValidationDetail: React.FC<Props> = ({ route }) => {
  const { readingId } = route.params;
  const [reading, setReading] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [correctedValue, setCorrectedValue] = useState('');

  useEffect(() => {
    loadReadingDetail();
  }, [readingId]);

  const loadReadingDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/management/readings/${readingId}`);
      setReading(response.data);
      setCorrectedValue(response.data.currentValue?.toString() || '');
    } catch (error) {
      console.error('Failed to load reading detail:', error);
      Alert.alert('Erreur', 'Impossible de charger les détails du relevé');
    } finally {
      setLoading(false);
    }
  };

  const validateReading = async (action: 'validate' | 'reject') => {
    if (action === 'reject' && !comments.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un commentaire pour le rejet');
      return;
    }

    try {
      setLoading(true);
      await api.put(`/management/readings/${readingId}/validate`, {
        action,
        comments: comments.trim(),
        correctedValue: correctedValue ? parseInt(correctedValue) : undefined
      });

      Alert.alert(
        'Succès',
        `Relevé ${action === 'validate' ? 'validé' : 'rejeté'} avec succès`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Validation failed:', error);
      Alert.alert('Erreur', 'Impossible de valider le relevé');
    } finally {
      setLoading(false);
    }
  };

  if (!reading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.detailCard}>
        <Card.Title 
          title={`${reading.buildingName} - Appartement ${reading.apartmentNumber}`}
          subtitle={`Compteur: ${reading.meterId}`}
        />
        <Card.Content>
          <View style={styles.valueSection}>
            <Text style={styles.label}>Relevé précédent:</Text>
            <Text style={styles.value}>{reading.previousValue} m³</Text>
          </View>

          <View style={styles.valueSection}>
            <Text style={styles.label}>Relevé actuel:</Text>
            <TextInput
              value={correctedValue}
              onChangeText={setCorrectedValue}
              keyboardType="numeric"
              style={styles.valueInput}
              mode="outlined"
            />
          </View>

          <View style={styles.valueSection}>
            <Text style={styles.label}>Consommation calculée:</Text>
            <Text style={styles.consumption}>
              {correctedValue ? (parseInt(correctedValue) - reading.previousValue) : reading.consumption} m³
            </Text>
          </View>

          <View style={styles.submissionSection}>
            <Text style={styles.label}>Soumis par:</Text>
            <Text style={styles.value}>{reading.submittedBy}</Text>
            <Text style={styles.date}>
              {new Date(reading.submittedAt).toLocaleString('fr-FR')}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {reading.photoUrl && (
        <Card style={styles.photoCard}>
          <Card.Title title="Photo du relevé" />
          <Card.Content>
            <Avatar.Image 
              size={200} 
              source={{ uri: reading.photoUrl }}
              style={styles.photo}
            />
          </Card.Content>
        </Card>
      )}

      <Card style={styles.actionCard}>
        <Card.Content>
          <TextInput
            label="Commentaires (obligatoire pour rejet)"
            value={comments}
            onChangeText={setComments}
            multiline
            numberOfLines={3}
            style={styles.commentsInput}
            mode="outlined"
          />

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={() => validateReading('validate')}
              loading={loading}
              style={[styles.button, styles.validateButton]}
              disabled={loading}
            >
              Valider
            </Button>

            <Button
              mode="outlined"
              onPress={() => validateReading('reject')}
              loading={loading}
              style={[styles.button, styles.rejectButton]}
              disabled={loading}
            >
              Rejeter
            </Button>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  detailCard: { margin: 16 },
  valueSection: { marginBottom: 16 },
  label: { fontSize: 14, color: 'gray', marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '500' },
  valueInput: { backgroundColor: 'white' },
  consumption: { fontSize: 16, color: '#1976d2', fontWeight: 'bold' },
  submissionSection: { marginTop: 16 },
  date: { fontSize: 12, color: 'gray', marginTop: 4 },
  photoCard: { margin: 16 },
  photo: { alignSelf: 'center' },
  actionCard: { margin: 16, marginTop: 0 },
  commentsInput: { marginBottom: 16, backgroundColor: 'white' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  button: { flex: 1, marginHorizontal: 8 },
  validateButton: { backgroundColor: '#4caf50' },
  rejectButton: { borderColor: '#f44336' }
});
```

### Backend Implementation

#### Service Validation Relevés
```typescript
// src/modules/management/reading-validation.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reading } from '../reading/entities/reading.entity';
import { ReadingValidationHistory } from './entities/reading-validation-history.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class ReadingValidationService {
  private readonly logger = new Logger(ReadingValidationService.name);

  constructor(
    @InjectRepository(Reading)
    private readingRepository: Repository<Reading>,
    @InjectRepository(ReadingValidationHistory)
    private historyRepository: Repository<ReadingValidationHistory>,
    private notificationService: NotificationService,
  ) {}

  async getPendingValidations(managerId: string, filters: any) {
    // Récupérer les immeubles gérés par le manager
    const managedBuildings = await this.getManagedBuildings(managerId);

    const query = this.readingRepository.createQueryBuilder('r')
      .leftJoinAndSelect('r.meter', 'm')
      .leftJoinAndSelect('m.apartment', 'a')
      .leftJoinAndSelect('a.building', 'b')
      .where('r.validation_status = :status', { status: 'pending' })
      .andWhere('b.id IN (:...buildingIds)', { buildingIds: managedBuildings });

    if (filters.buildingId) {
      query.andWhere('b.id = :buildingId', { buildingId: filters.buildingId });
    }

    if (filters.search) {
      query.andWhere(
        '(b.name ILIKE :search OR a.apartment_number ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return query
      .orderBy('r.submitted_at', 'DESC')
      .paginate(filters.page, filters.limit);
  }

  async validateReading(
    readingId: string, 
    managerId: string, 
    action: 'validate' | 'reject',
    comments?: string,
    correctedValue?: number
  ) {
    const reading = await this.readingRepository.findOne({
      where: { id: readingId },
      relations: ['meter', 'meter.apartment', 'meter.apartment.building']
    });

    if (!reading) {
      throw new Error('Reading not found');
    }

    // Vérifier que le manager gère cet immeuble
    await this.verifyBuildingAccess(managerId, reading.meter.apartment.building.id);

    const previousStatus = reading.validation_status;

    // Mettre à jour le relevé
    reading.validation_status = action === 'validate' ? 'validated' : 'rejected';
    reading.validated_at = new Date();
    reading.validated_by = managerId;
    reading.validation_comments = comments;

    if (correctedValue !== undefined) {
      reading.current_value = correctedValue;
      reading.consumption = correctedValue - reading.previous_value;
    }

    if (action === 'reject') {
      reading.rejection_reason = comments;
    }

    await this.readingRepository.save(reading);

    // Créer l'historique
    await this.historyRepository.save({
      reading_id: readingId,
      previous_status: previousStatus,
      new_status: reading.validation_status,
      changed_by: managerId,
      change_reason: comments,
      corrected_value: correctedValue
    });

    // Notifier le releveur
    await this.notifyReader(reading, action, comments);

    return reading;
  }

  async getValidationHistory(managerId: string, filters: any) {
    const managedBuildings = await this.getManagedBuildings(managerId);

    const query = this.readingRepository.createQueryBuilder('r')
      .leftJoinAndSelect('r.validated_by_user', 'validator')
      .leftJoinAndSelect('r.meter', 'm')
      .leftJoinAndSelect('m.apartment', 'a')
      .leftJoinAndSelect('a.building', 'b')
      .where('b.id IN (:...buildingIds)', { buildingIds: managedBuildings })
      .andWhere('r.validation_status IN (:...statuses)', { 
        statuses: ['validated', 'rejected'] 
      });

    if (filters.dateFrom) {
      query.andWhere('r.validated_at >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters.dateTo) {
      query.andWhere('r.validated_at <= :dateTo', { dateTo: filters.dateTo });
    }

    return query
      .orderBy('r.validated_at', 'DESC')
      .paginate(filters.page, filters.limit);
  }

  private async getManagedBuildings(managerId: string): Promise<string[]> {
    // Implémentation dépendante du modèle de données
    // Retourner les IDs des immeubles gérés par le manager
    return ['building-1', 'building-2']; // Placeholder
  }

  private async verifyBuildingAccess(managerId: string, buildingId: string): Promise<void> {
    const managedBuildings = await this.getManagedBuildings(managerId);
    if (!managedBuildings.includes(buildingId)) {
      throw new Error('Access denied to this building');
    }
  }

  private async notifyReader(reading: any, action: string, comments?: string): Promise<void> {
    const title = action === 'validate' ? 'Relevé validé' : 'Relevé rejeté';
    const body = action === 'validate' 
      ? `Votre relevé pour l'appartement ${reading.meter.apartment.apartment_number} a été validé.`
      : `Votre relevé pour l'appartement ${reading.meter.apartment.apartment_number} a été rejeté. ${comments || ''}`;

    await this.notificationService.sendNotification(
      [reading.submitted_by],
      title,
      body,
      {
        type: 'reading_validation',
        readingId: reading.id,
        action
      }
    );
  }
}
```

### Testing Strategy

#### Unit Tests
```typescript
// src/modules/management/reading-validation.service.spec.ts
describe('ReadingValidationService', () => {
  it('should validate reading successfully', async () => {
    // Test validation relevé
  });

  it('should reject reading with comments', async () => {
    // Test rejet relevé
  });

  it('should enforce building access control', async () => {
    // Test contrôle d'accès
  });

  it('should notify reader on validation decision', async () => {
    // Test notification releveur
  });
});
```

#### E2E Tests (Playwright)
```typescript
// e2e/reading-validation.spec.ts
test('Manager can validate readings', async ({ page }) => {
  // Test validation interface
});

test('Manager can reject readings with comments', async ({ page }) => {
  // Test rejet avec commentaires
});
```

### Implementation Checklist
- [ ] Extension table readings pour validation
- [ ] Création table reading_validation_history
- [ ] Implémentation ReadingValidationService
- [ ] API endpoints pour validation
- [ ] Composant liste relevés en attente
- [ ] Composant détail et validation
- [ ] Contrôle d'accès par immeuble
- [ ] Notifications aux releveurs
- [ ] Tests unitaires et E2E
- [ ] Interface responsive

### Dependencies
- React Navigation pour navigation
- React Native Paper pour UI
- TypeORM pour base de données
- React Native Image Viewer pour photos

### Risks & Mitigations
- **Risque**: Erreurs de validation en masse
  - **Mitigation**: Validation individuelle + confirmation
- **Risque**: Pertes de données lors correction
  - **Mitigation**: Historique complet + audit trail
- **Risque**: Notifications non reçues
  - **Mitigation**: Retry automatique + fallback email

### Performance Considerations
- Pagination pour listes longues
- Lazy loading des images
- Index database optimisés
- Cache pour données fréquemment consultées