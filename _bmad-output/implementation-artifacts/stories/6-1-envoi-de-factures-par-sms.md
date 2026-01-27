# Story 6-1: Envoi de Factures par SMS

## Story Header
- **Story ID**: 6-1
- **Key**: WH-6-1
- **Epic**: Epic 6 - Envoi et Communication
- **Title**: Envoi de Factures par SMS
- **Status**: Ready for Dev
- **Assignee**: TBD
- **Created Date**: 2026-01-26
- **Updated Date**: 2026-01-26
- **Story Points**: 8

## User Story
En tant que **gestionnaire d'immeuble**, je veux **recevoir automatiquement les factures par SMS** afin que **je puisse informer rapidement mes locataires des nouveaux montants dus**.

En tant que **locataire**, je veux **recevoir mes factures par SMS** afin que **je puisse payer rapidement et éviter les relances**.

## Acceptance Criteria
### Fonctionnel
- [ ] Les factures sont automatiquement envoyées par SMS après génération
- [ ] Le SMS contient le montant total, la période, et un lien de paiement
- [ ] Les destinataires peuvent être configurés par immeuble (gestionnaire + locataires)
- [ ] Statut d'envoi SMS tracké dans la base de données
- [ ] Retry automatique en cas d'échec d'envoi
- [ ] Interface pour consulter l'historique des SMS envoyés

### Non-Fonctionnel
- [ ] Taux de succès d'envoi > 95%
- [ ] Délai d'envoi < 5 minutes après génération facture
- [ ] Support des opérateurs africains via Africa's Talking
- [ ] Gestion des fuseaux horaires africains
- [ ] Logs détaillés pour debugging

## Technical Requirements

### Architecture Context
- **Bounded Context**: Billing & Communication
- **Integration Points**: Africa's Talking SMS API, Billing Service
- **Security**: API keys sécurisées, rate limiting
- **Performance**: Async processing pour éviter blocage génération factures

### API Endpoints

#### Backend (NestJS)
```typescript
// Envoi SMS facture
POST /api/billing/invoices/{id}/send-sms
Authorization: Bearer {token}
Content-Type: application/json

{
  "recipients": ["+22501020304", "+22505060708"],
  "messageTemplate": "invoice_sms"
}

// Historique SMS
GET /api/communication/sms-history
Query: ?invoiceId={id}&status={status}&dateFrom={date}&dateTo={date}
Authorization: Bearer {token}

// Statut SMS
GET /api/communication/sms/{id}/status
Authorization: Bearer {token}
```

#### Mobile (React Native)
```typescript
// Service SMS
interface SmsService {
  sendInvoiceSms(invoiceId: string, recipients: string[]): Promise<SmsResult>;
  getSmsHistory(filters: SmsFilters): Promise<SmsHistory[]>;
  getSmsStatus(smsId: string): Promise<SmsStatus>;
}
```

### Database Schema

#### Table: sms_messages
```sql
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES invoices(id),
  recipient_phone VARCHAR(20) NOT NULL,
  message_text TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, failed
  provider_message_id VARCHAR(100),
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_sms_invoice ON sms_messages(invoice_id);
CREATE INDEX idx_sms_status ON sms_messages(status);
CREATE INDEX idx_sms_recipient ON sms_messages(recipient_phone);
CREATE INDEX idx_sms_sent_at ON sms_messages(sent_at);
```

#### Table: sms_templates
```sql
CREATE TABLE sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  template_text TEXT NOT NULL,
  variables JSONB, -- Liste des variables disponibles
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Template par défaut pour factures
INSERT INTO sms_templates (name, template_text, variables) VALUES
('invoice_sms', 'Facture WaterHouse - Periode: {period} - Montant: {amount} XAF - Payez via: {payment_link}', 
 '{"period": "string", "amount": "number", "payment_link": "string"}');
```

### Mobile Implementation

#### Service SMS (TypeScript)
```typescript
// src/services/smsService.ts
import { api } from '../api/baseApi';

export interface SmsRecipient {
  phone: string;
  name?: string;
  type: 'manager' | 'tenant';
}

export interface SmsResult {
  success: boolean;
  smsIds: string[];
  errors?: string[];
}

export class SmsService {
  static async sendInvoiceSms(
    invoiceId: string, 
    recipients: SmsRecipient[]
  ): Promise<SmsResult> {
    try {
      const response = await api.post(`/billing/invoices/${invoiceId}/send-sms`, {
        recipients: recipients.map(r => r.phone),
        messageTemplate: 'invoice_sms'
      });
      
      return {
        success: true,
        smsIds: response.data.smsIds
      };
    } catch (error) {
      return {
        success: false,
        smsIds: [],
        errors: [error.message]
      };
    }
  }

  static async getSmsHistory(invoiceId?: string): Promise<any[]> {
    const params = invoiceId ? { invoiceId } : {};
    const response = await api.get('/communication/sms-history', { params });
    return response.data;
  }
}
```

#### Composant Historique SMS
```typescript
// src/components/communication/SmsHistory.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { Card, Chip } from 'react-native-paper';
import { SmsService } from '../../services/smsService';

export const SmsHistory: React.FC<{ invoiceId?: string }> = ({ invoiceId }) => {
  const [smsHistory, setSmsHistory] = useState([]);

  useEffect(() => {
    loadSmsHistory();
  }, [invoiceId]);

  const loadSmsHistory = async () => {
    const history = await SmsService.getSmsHistory(invoiceId);
    setSmsHistory(history);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'sent': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={smsHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card style={styles.smsCard}>
            <Card.Content>
              <View style={styles.header}>
                <Text style={styles.phone}>{item.recipient_phone}</Text>
                <Chip 
                  mode="outlined" 
                  textStyle={{ color: getStatusColor(item.status) }}
                >
                  {item.status}
                </Chip>
              </View>
              <Text style={styles.message}>{item.message_text}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.sent_at).toLocaleString('fr-FR')}
              </Text>
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  smsCard: { marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  phone: { fontWeight: 'bold' },
  message: { marginVertical: 8, fontSize: 14 },
  timestamp: { fontSize: 12, color: 'gray' }
});
```

### Backend Implementation

#### Service SMS (NestJS)
```typescript
// src/modules/communication/sms.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsMessage } from './entities/sms-message.entity';
import { AfricasTalkingService } from '../../integrations/africas-talking/africas-talking.service';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  constructor(
    @InjectRepository(SmsMessage)
    private smsRepository: Repository<SmsMessage>,
    private africasTalkingService: AfricasTalkingService,
  ) {}

  async sendInvoiceSms(
    invoiceId: string,
    recipients: string[],
    templateData: any
  ): Promise<string[]> {
    const smsIds: string[] = [];

    for (const phone of recipients) {
      try {
        // Créer l'entrée SMS en base
        const smsMessage = this.smsRepository.create({
          invoice_id: invoiceId,
          recipient_phone: phone,
          message_text: this.buildMessage(templateData),
          status: 'pending'
        });
        await this.smsRepository.save(smsMessage);

        // Envoyer via Africa's Talking
        const result = await this.africasTalkingService.sendSms(
          phone, 
          smsMessage.message_text
        );

        // Mettre à jour le statut
        smsMessage.status = result.success ? 'sent' : 'failed';
        smsMessage.provider_message_id = result.messageId;
        smsMessage.sent_at = new Date();
        if (!result.success) {
          smsMessage.error_message = result.error;
        }
        await this.smsRepository.save(smsMessage);

        smsIds.push(smsMessage.id);
      } catch (error) {
        this.logger.error(`Failed to send SMS to ${phone}:`, error);
        // Créer entrée avec statut failed
        const failedSms = this.smsRepository.create({
          invoice_id: invoiceId,
          recipient_phone: phone,
          message_text: this.buildMessage(templateData),
          status: 'failed',
          error_message: error.message
        });
        await this.smsRepository.save(failedSms);
      }
    }

    return smsIds;
  }

  private buildMessage(templateData: any): string {
    // Template: "Facture WaterHouse - Periode: {period} - Montant: {amount} XAF - Payez via: {payment_link}"
    return `Facture WaterHouse - Periode: ${templateData.period} - Montant: ${templateData.amount} XAF - Payez via: ${templateData.paymentLink}`;
  }

  async getSmsHistory(filters: any): Promise<SmsMessage[]> {
    const query = this.smsRepository.createQueryBuilder('sms');
    
    if (filters.invoiceId) {
      query.andWhere('sms.invoice_id = :invoiceId', { invoiceId: filters.invoiceId });
    }
    if (filters.status) {
      query.andWhere('sms.status = :status', { status: filters.status });
    }
    if (filters.dateFrom) {
      query.andWhere('sms.sent_at >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters.dateTo) {
      query.andWhere('sms.sent_at <= :dateTo', { dateTo: filters.dateTo });
    }

    return query.orderBy('sms.sent_at', 'DESC').getMany();
  }
}
```

#### Integration Africa's Talking
```typescript
// src/integrations/africas-talking/africas-talking.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AfricasTalkingService {
  private readonly logger = new Logger(AfricasTalkingService.name);
  private readonly apiUrl = 'https://api.africastalking.com/version1/messaging';
  
  constructor(private configService: ConfigService) {}

  async sendSms(phone: string, message: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
  }> {
    try {
      const response = await axios.post(this.apiUrl, {
        username: this.configService.get('AFRICAS_TALKING_USERNAME'),
        to: phone,
        message: message,
        from: this.configService.get('AFRICAS_TALKING_SHORTCODE')
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'apiKey': this.configService.get('AFRICAS_TALKING_API_KEY')
        }
      });

      if (response.data.SMSMessageData?.Recipients?.[0]?.status === 'Success') {
        return {
          success: true,
          messageId: response.data.SMSMessageData.MessageId
        };
      } else {
        return {
          success: false,
          error: response.data.SMSMessageData?.Recipients?.[0]?.status || 'Unknown error'
        };
      }
    } catch (error) {
      this.logger.error('Africa''s Talking API error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}
```

### Testing Strategy

#### Unit Tests
```typescript
// src/modules/communication/sms.service.spec.ts
describe('SmsService', () => {
  let service: SmsService;
  let smsRepository: MockType<Repository<SmsMessage>>;
  let africasTalkingService: MockType<AfricasTalkingService>;

  beforeEach(async () => {
    // Setup mocks et service
  });

  it('should send SMS successfully', async () => {
    // Test envoi SMS réussi
  });

  it('should handle SMS sending failure', async () => {
    // Test gestion échec envoi
  });

  it('should build message from template', async () => {
    // Test construction message
  });
});
```

#### Integration Tests
```typescript
// Test end-to-end envoi SMS
describe('SMS Integration', () => {
  it('should send invoice SMS to multiple recipients', async () => {
    // Test complet envoi SMS facture
  });

  it('should track SMS status correctly', async () => {
    // Test suivi statut SMS
  });
});
```

#### E2E Tests (Playwright)
```typescript
// e2e/sms-communication.spec.ts
test('Gestionnaire can view SMS history', async ({ page }) => {
  // Test interface historique SMS
});
```

### Implementation Checklist
- [ ] Configuration Africa's Talking API
- [ ] Création tables sms_messages et sms_templates
- [ ] Implémentation SmsService backend
- [ ] Intégration Africa's Talking
- [ ] API endpoints pour envoi et historique
- [ ] Service SMS mobile
- [ ] Composant historique SMS
- [ ] Tests unitaires et d'intégration
- [ ] Gestion des erreurs et retry
- [ ] Logs et monitoring
- [ ] Documentation API

### Dependencies
- Africa's Talking SDK
- TypeORM pour base de données
- Axios pour HTTP requests
- React Native Paper pour UI mobile

### Risks & Mitigations
- **Risque**: Échec envoi SMS chez opérateurs africains
  - **Mitigation**: Retry automatique + fallback email
- **Risque**: Coûts SMS élevés
  - **Mitigation**: Rate limiting + monitoring consommation
- **Risque**: Numéros invalides
  - **Mitigation**: Validation format téléphone africain

### Performance Considerations
- Async processing pour envoi SMS
- Index database pour requêtes fréquentes
- Cache pour templates SMS
- Rate limiting API Africa's Talking