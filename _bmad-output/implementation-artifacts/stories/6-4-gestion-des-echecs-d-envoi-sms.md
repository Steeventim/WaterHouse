# Story 6-4: Gestion des Échecs d'Envoi SMS

## Story Header
- **Story ID**: 6-4
- **Key**: WH-6-4
- **Epic**: Epic 6 - Envoi et Communication
- **Title**: Gestion des Échecs d'Envoi SMS
- **Status**: Ready for Dev
- **Assignee**: TBD
- **Created Date**: 2026-01-26
- **Updated Date**: 2026-01-26
- **Story Points**: 8

## User Story
En tant que **gestionnaire d'immeuble**, je veux **être informé des échecs d'envoi de SMS** afin que **je puisse contacter manuellement mes locataires si nécessaire**.

En tant qu'**administrateur système**, je veux **un système de retry automatique pour les SMS échoués** afin que **le taux de succès des communications soit maximisé**.

## Acceptance Criteria
### Fonctionnel
- [ ] Retry automatique (3 tentatives max) pour SMS échoués
- [ ] Délai exponentiel entre retries (1min, 5min, 30min)
- [ ] Notifications aux gestionnaires pour échecs définitifs
- [ ] Interface pour re-tenter manuellement l'envoi
- [ ] Classification des erreurs (temporaire/permanent)
- [ ] Quarantaine des numéros invalides
- [ ] Dashboard de monitoring des échecs

### Non-Fonctionnel
- [ ] Taux de succès final > 98% (avec retries)
- [ ] Retry asynchrone sans blocage du processus principal
- [ ] Gestion des timeouts et circuit breaker
- [ ] Alertes automatiques pour taux d'échec élevés

## Technical Requirements

### Architecture Context
- **Bounded Context**: Communication & Reliability
- **Integration Points**: Africa's Talking API, Queue System, Notification Service
- **Security**: Validation des numéros, rate limiting
- **Performance**: Async processing, queue-based retry system

### API Endpoints

#### Backend (NestJS)
```typescript
// Retry manuel d'un SMS
POST /api/admin/sms/{smsId}/retry
Authorization: Bearer {admin-token}

// Liste des SMS échoués
GET /api/admin/sms/failed
Authorization: Bearer {admin-token}
Query: ?page={number}&limit={number}&reason={reason}&dateFrom={date}&dateTo={date}

// Métriques d'échec
GET /api/admin/sms/failure-metrics
Authorization: Bearer {admin-token}
Query: ?period={day|week|month}

// Quarantaine des numéros
GET /api/admin/sms/quarantined-numbers
POST /api/admin/sms/quarantined-numbers/{phone}/unquarantine
Authorization: Bearer {admin-token}

// Configuration retry
GET /api/admin/sms/retry-config
PUT /api/admin/sms/retry-config
Authorization: Bearer {admin-token}
```

### Database Schema

#### Extension de sms_messages
```sql
-- Ajout de colonnes pour gestion retry
ALTER TABLE sms_messages ADD COLUMN retry_count INTEGER DEFAULT 0;
ALTER TABLE sms_messages ADD COLUMN next_retry_at TIMESTAMP;
ALTER TABLE sms_messages ADD COLUMN last_error_code VARCHAR(50);
ALTER TABLE sms_messages ADD COLUMN quarantined BOOLEAN DEFAULT false;
ALTER TABLE sms_messages ADD COLUMN quarantined_at TIMESTAMP;
ALTER TABLE sms_messages ADD COLUMN manual_retry_count INTEGER DEFAULT 0;
```

#### Table: sms_retry_config
```sql
CREATE TABLE sms_retry_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  max_retries INTEGER DEFAULT 3,
  retry_delays_minutes INTEGER[] DEFAULT '{1, 5, 30}', -- Délais en minutes
  quarantine_threshold INTEGER DEFAULT 5, -- Nombre d'échecs avant quarantaine
  quarantine_duration_hours INTEGER DEFAULT 24, -- Durée quarantaine
  enabled BOOLEAN DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);
```

#### Table: sms_failure_reasons
```sql
CREATE TABLE sms_failure_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  is_temporary BOOLEAN DEFAULT true, -- true = retry possible, false = échec définitif
  quarantine_trigger BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Raisons d'échec communes
INSERT INTO sms_failure_reasons (code, description, is_temporary, quarantine_trigger) VALUES
('INVALID_NUMBER', 'Numéro de téléphone invalide', false, true),
('INSUFFICIENT_BALANCE', 'Solde insuffisant chez l''opérateur', true, false),
('NETWORK_ERROR', 'Erreur réseau temporaire', true, false),
('TIMEOUT', 'Timeout de l''opérateur', true, false),
('BLOCKED_NUMBER', 'Numéro bloqué par l''opérateur', false, true),
('UNKNOWN_ERROR', 'Erreur inconnue', true, false);
```

### Backend Implementation

#### Service Retry SMS
```typescript
// src/modules/communication/sms-retry.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { SmsMessage } from './entities/sms-message.entity';
import { SmsRetryConfig } from './entities/sms-retry-config.entity';
import { SmsFailureReason } from './entities/sms-failure-reason.entity';
import { AfricasTalkingService } from '../../integrations/africas-talking/africas-talking.service';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class SmsRetryService {
  private readonly logger = new Logger(SmsRetryService.name);

  constructor(
    @InjectRepository(SmsMessage)
    private smsRepository: Repository<SmsMessage>,
    @InjectRepository(SmsRetryConfig)
    private configRepository: Repository<SmsRetryConfig>,
    @InjectRepository(SmsFailureReason)
    private failureReasonRepository: Repository<SmsFailureReason>,
    @InjectQueue('sms-retry')
    private smsRetryQueue: Queue,
    private africasTalkingService: AfricasTalkingService,
  ) {}

  async handleSmsFailure(
    smsId: string, 
    errorCode: string, 
    errorMessage: string
  ): Promise<void> {
    const sms = await this.smsRepository.findOne({ where: { id: smsId } });
    if (!sms) return;

    const config = await this.getRetryConfig();
    const failureReason = await this.failureReasonRepository.findOne({
      where: { code: errorCode }
    });

    // Mettre à jour le SMS avec l'erreur
    sms.status = 'failed';
    sms.error_message = errorMessage;
    sms.last_error_code = errorCode;
    sms.failed_at = new Date();
    sms.retry_count = (sms.retry_count || 0) + 1;

    // Vérifier si retry possible
    const canRetry = failureReason?.is_temporary && 
                    sms.retry_count < config.max_retries;

    if (canRetry) {
      // Programmer un retry
      const delayMinutes = config.retry_delays_minutes[sms.retry_count - 1] || 30;
      const nextRetryAt = new Date();
      nextRetryAt.setMinutes(nextRetryAt.getMinutes() + delayMinutes);

      sms.status = 'pending';
      sms.next_retry_at = nextRetryAt;

      // Ajouter à la queue
      await this.smsRetryQueue.add(
        'retry-sms',
        { smsId: sms.id },
        { delay: delayMinutes * 60 * 1000 } // Convertir en ms
      );

      this.logger.log(`Scheduled retry for SMS ${smsId} in ${delayMinutes} minutes`);
    } else {
      // Échec définitif
      sms.status = 'failed';
      
      // Vérifier quarantaine
      if (failureReason?.quarantine_trigger) {
        await this.quarantineNumber(sms.recipient_phone);
      }

      // Notifier le gestionnaire
      await this.notifyManagerOfFailure(sms);
    }

    await this.smsRepository.save(sms);
  }

  async processSmsRetry(job: any): Promise<void> {
    const { smsId } = job.data;
    
    try {
      const sms = await this.smsRepository.findOne({ where: { id: smsId } });
      if (!sms || sms.status !== 'pending') return;

      // Vérifier si numéro en quarantaine
      if (await this.isNumberQuarantined(sms.recipient_phone)) {
        sms.status = 'failed';
        sms.error_message = 'Number is quarantined';
        await this.smsRepository.save(sms);
        return;
      }

      // Tenter de renvoyer
      const result = await this.africasTalkingService.sendSms(
        sms.recipient_phone, 
        sms.message_text
      );

      if (result.success) {
        sms.status = 'sent';
        sms.sent_at = new Date();
        sms.provider_message_id = result.messageId;
        sms.retry_count = (sms.retry_count || 0) + 1;
        this.logger.log(`SMS ${smsId} sent successfully on retry ${sms.retry_count}`);
      } else {
        // Échec du retry
        await this.handleSmsFailure(smsId, 'RETRY_FAILED', result.error);
      }

      await this.smsRepository.save(sms);
    } catch (error) {
      this.logger.error(`Error processing SMS retry ${smsId}:`, error);
      await this.handleSmsFailure(smsId, 'RETRY_ERROR', error.message);
    }
  }

  async manualRetry(smsId: string, userId: string): Promise<boolean> {
    const sms = await this.smsRepository.findOne({ where: { id: smsId } });
    if (!sms) throw new Error('SMS not found');

    // Vérifier si numéro en quarantaine
    if (await this.isNumberQuarantined(sms.recipient_phone)) {
      throw new Error('Number is quarantined');
    }

    try {
      const result = await this.africasTalkingService.sendSms(
        sms.recipient_phone, 
        sms.message_text
      );

      sms.manual_retry_count = (sms.manual_retry_count || 0) + 1;

      if (result.success) {
        sms.status = 'sent';
        sms.sent_at = new Date();
        sms.provider_message_id = result.messageId;
        sms.error_message = null;
        sms.last_error_code = null;
      } else {
        sms.status = 'failed';
        sms.error_message = result.error;
        sms.last_error_code = 'MANUAL_RETRY_FAILED';
      }

      await this.smsRepository.save(sms);
      return result.success;
    } catch (error) {
      sms.status = 'failed';
      sms.error_message = error.message;
      sms.last_error_code = 'MANUAL_RETRY_ERROR';
      sms.manual_retry_count = (sms.manual_retry_count || 0) + 1;
      await this.smsRepository.save(sms);
      return false;
    }
  }

  async quarantineNumber(phoneNumber: string): Promise<void> {
    const config = await this.getRetryConfig();
    
    // Marquer tous les SMS récents pour ce numéro comme en quarantaine
    await this.smsRepository.update(
      { 
        recipient_phone: phoneNumber,
        created_at: LessThan(new Date(Date.now() - 24 * 60 * 60 * 1000)) // Dernières 24h
      },
      { 
        quarantined: true, 
        quarantined_at: new Date() 
      }
    );

    this.logger.warn(`Number ${phoneNumber} quarantined`);
  }

  async unquarantineNumber(phoneNumber: string): Promise<void> {
    await this.smsRepository.update(
      { recipient_phone: phoneNumber },
      { 
        quarantined: false, 
        quarantined_at: null 
      }
    );

    this.logger.log(`Number ${phoneNumber} unquarantined`);
  }

  private async isNumberQuarantined(phoneNumber: string): Promise<boolean> {
    const config = await this.getRetryConfig();
    const quarantineDuration = config.quarantine_duration_hours * 60 * 60 * 1000;

    const quarantinedSms = await this.smsRepository.findOne({
      where: {
        recipient_phone: phoneNumber,
        quarantined: true,
        quarantined_at: LessThan(new Date(Date.now() - quarantineDuration))
      }
    });

    return !!quarantinedSms;
  }

  private async getRetryConfig(): Promise<SmsRetryConfig> {
    let config = await this.configRepository.findOne({ order: { updated_at: 'DESC' } });
    
    if (!config) {
      config = this.configRepository.create({});
      await this.configRepository.save(config);
    }

    return config;
  }

  private async notifyManagerOfFailure(sms: SmsMessage): Promise<void> {
    // Trouver le gestionnaire de l'immeuble
    // Implémentation dépendante du modèle de données des immeubles
    
    // Envoyer notification push ou email
    // this.notificationService.sendNotification(...)
  }

  // Nettoyer les anciens SMS en quarantaine
  @Cron('0 0 * * *') // Tous les jours à minuit
  async cleanupQuarantinedNumbers(): Promise<void> {
    const config = await this.getRetryConfig();
    const cutoffDate = new Date(Date.now() - config.quarantine_duration_hours * 60 * 60 * 1000);

    const result = await this.smsRepository.update(
      {
        quarantined: true,
        quarantined_at: LessThan(cutoffDate)
      },
      { quarantined: false, quarantined_at: null }
    );

    this.logger.log(`Cleaned up ${result.affected} quarantined numbers`);
  }
}
```

#### Queue Processor
```typescript
// src/modules/communication/sms-retry.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { SmsRetryService } from './sms-retry.service';

@Processor('sms-retry')
@Injectable()
export class SmsRetryProcessor extends WorkerHost {
  constructor(private readonly smsRetryService: SmsRetryService) {
    super();
  }

  async process(job: any): Promise<void> {
    await this.smsRetryService.processSmsRetry(job);
  }
}
```

#### Contrôleur Admin
```typescript
// src/modules/admin/sms-failures.controller.ts
import { Controller, Get, Post, Put, Param, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/admin.guard';
import { SmsRetryService } from '../communication/sms-retry.service';

@Controller('admin/sms')
@UseGuards(AdminGuard)
export class SmsFailuresController {
  constructor(private readonly smsRetryService: SmsRetryService) {}

  @Post(':smsId/retry')
  async manualRetry(@Param('smsId') smsId: string) {
    const success = await this.smsRetryService.manualRetry(smsId, 'admin-user-id');
    return { success };
  }

  @Get('failed')
  async getFailedSms(@Query() filters: any) {
    // Retourner liste SMS échoués avec pagination
    return this.smsRepository.find({
      where: { status: 'failed' },
      order: { created_at: 'DESC' },
      // ... filtres et pagination
    });
  }

  @Get('quarantined-numbers')
  async getQuarantinedNumbers() {
    // Retourner numéros en quarantaine
  }

  @Post('quarantined-numbers/:phone/unquarantine')
  async unquarantineNumber(@Param('phone') phone: string) {
    await this.smsRetryService.unquarantineNumber(phone);
    return { success: true };
  }

  @Get('failure-metrics')
  async getFailureMetrics(@Query('period') period: string) {
    // Retourner métriques d'échec
  }
}
```

### Mobile Implementation

#### Interface de Gestion des Échecs (React)
```typescript
// src/components/admin/SmsFailuresDashboard.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Card, Text, Button, Chip, FAB } from 'react-native-paper';
import { api } from '../../services/api';

export const SmsFailuresDashboard: React.FC = () => {
  const [failedSms, setFailedSms] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFailedSms();
  }, []);

  const loadFailedSms = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/sms/failed');
      setFailedSms(response.data);
    } catch (error) {
      console.error('Failed to load failed SMS:', error);
    } finally {
      setLoading(false);
    }
  };

  const retrySms = async (smsId: string) => {
    try {
      const response = await api.post(`/admin/sms/${smsId}/retry`);
      if (response.data.success) {
        Alert.alert('Succès', 'SMS renvoyé avec succès');
        loadFailedSms(); // Recharger la liste
      } else {
        Alert.alert('Échec', 'Le renvoi a échoué');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de renvoyer le SMS');
    }
  };

  const getErrorColor = (errorCode: string) => {
    switch (errorCode) {
      case 'INVALID_NUMBER': return 'red';
      case 'TIMEOUT': return 'orange';
      case 'NETWORK_ERROR': return 'yellow';
      default: return 'gray';
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SMS Échoués</Text>
      
      <FlatList
        data={failedSms}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadFailedSms}
        renderItem={({ item }) => (
          <Card style={styles.smsCard}>
            <Card.Content>
              <View style={styles.header}>
                <Text style={styles.phone}>{item.recipient_phone}</Text>
                <Chip 
                  mode="outlined" 
                  textStyle={{ color: getErrorColor(item.last_error_code) }}
                >
                  {item.last_error_code}
                </Chip>
              </View>
              
              <Text style={styles.message} numberOfLines={2}>
                {item.message_text}
              </Text>
              
              <Text style={styles.details}>
                Tentatives: {item.retry_count || 0} | 
                Manuel: {item.manual_retry_count || 0}
              </Text>
              
              <Text style={styles.error}>{item.error_message}</Text>
              
              <View style={styles.actions}>
                <Button 
                  mode="outlined" 
                  onPress={() => retrySms(item.id)}
                  disabled={item.quarantined}
                >
                  {item.quarantined ? 'En Quarantaine' : 'Renvoyer'}
                </Button>
              </View>
            </Card.Content>
          </Card>
        )}
      />

      <FAB
        icon="refresh"
        onPress={loadFailedSms}
        style={styles.fab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  smsCard: { marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phone: { fontWeight: 'bold' },
  message: { marginVertical: 8, fontSize: 14 },
  details: { fontSize: 12, color: 'gray' },
  error: { fontSize: 12, color: 'red', marginTop: 4 },
  actions: { marginTop: 8 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 }
});
```

### Testing Strategy

#### Unit Tests
```typescript
// src/modules/communication/sms-retry.service.spec.ts
describe('SmsRetryService', () => {
  it('should schedule retry for temporary failures', async () => {
    // Test retry automatique
  });

  it('should quarantine invalid numbers', async () => {
    // Test quarantaine
  });

  it('should handle manual retry', async () => {
    // Test retry manuel
  });

  it('should notify managers of permanent failures', async () => {
    // Test notification gestionnaire
  });
});
```

#### Integration Tests
```typescript
describe('SMS Retry Integration', () => {
  it('should process retry queue', async () => {
    // Test queue processing
  });

  it('should handle circuit breaker for failing operators', async () => {
    // Test circuit breaker
  });
});
```

### Implementation Checklist
- [ ] Extension table sms_messages pour retry
- [ ] Création tables sms_retry_config et sms_failure_reasons
- [ ] Implémentation SmsRetryService
- [ ] Configuration queue Bull pour retry
- [ ] API endpoints admin pour gestion échecs
- [ ] Interface dashboard échecs SMS
- [ ] Classification erreurs et quarantaine
- [ ] Notifications gestionnaires
- [ ] Tests unitaires et d'intégration
- [ ] Monitoring et alertes
- [ ] Cleanup automatique quarantaine

### Dependencies
- @nestjs/bull pour queue system
- Bull pour job queue
- @nestjs/schedule pour cron jobs
- TypeORM pour base de données

### Risks & Mitigations
- **Risque**: Spam lors des retries
  - **Mitigation**: Rate limiting + circuit breaker
- **Risque**: Coûts élevés des retries
  - **Mitigation**: Limitation nombre de retries + monitoring
- **Risque**: Numéros valides mis en quarantaine
  - **Mitigation**: Seuils configurables + revue manuelle

### Performance Considerations
- Queue asynchrone pour ne pas bloquer
- Index pour requêtes fréquentes
- Batch processing pour métriques
- Circuit breaker pour opérateurs défaillants
- Cache pour configuration retry