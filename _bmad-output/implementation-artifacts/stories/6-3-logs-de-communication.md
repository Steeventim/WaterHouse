# Story 6-3: Logs de Communication

## Story Header
- **Story ID**: 6-3
- **Key**: WH-6-3
- **Epic**: Epic 6 - Envoi et Communication
- **Title**: Logs de Communication
- **Status**: Ready for Dev
- **Assignee**: TBD
- **Created Date**: 2026-01-26
- **Updated Date**: 2026-01-26
- **Story Points**: 5

## User Story
En tant qu'**administrateur système**, je veux **consulter les logs détaillés de toutes les communications** afin que **je puisse monitorer la santé du système et diagnostiquer les problèmes**.

En tant que **gestionnaire d'immeuble**, je veux **voir l'historique des communications avec mes locataires** afin que **je puisse vérifier que les factures ont été envoyées correctement**.

## Acceptance Criteria
### Fonctionnel
- [ ] Logs détaillés pour tous les SMS envoyés
- [ ] Logs détaillés pour toutes les notifications push
- [ ] Logs pour les emails (futur)
- [ ] Interface d'administration pour consulter les logs
- [ ] Filtres par date, type, statut, utilisateur
- [ ] Export des logs en CSV/JSON
- [ ] Métriques de succès/échec des communications
- [ ] Alertes sur taux d'échec élevés

### Non-Fonctionnel
- [ ] Rétention des logs: 1 an minimum
- [ ] Performance des requêtes de logs
- [ ] Chiffrement des données sensibles dans les logs
- [ ] Audit trail complet des actions administrateur

## Technical Requirements

### Architecture Context
- **Bounded Context**: Communication & Administration
- **Integration Points**: SMS Service, Notification Service, Email Service
- **Security**: Chiffrement des logs, accès administrateur uniquement
- **Performance**: Indexation pour requêtes rapides, archivage automatique

### API Endpoints

#### Backend (NestJS)
```typescript
// Récupération des logs de communication
GET /api/admin/communication-logs
Authorization: Bearer {admin-token}
Query: ?type={sms|push|email}&status={success|failed}&userId={uuid}&startDate={date}&endDate={date}&page={number}&limit={number}

// Détails d'un log spécifique
GET /api/admin/communication-logs/{id}
Authorization: Bearer {admin-token}

// Métriques de communication
GET /api/admin/communication-metrics
Authorization: Bearer {admin-token}
Query: ?period={day|week|month}&type={sms|push|email}

// Export des logs
GET /api/admin/communication-logs/export
Authorization: Bearer {admin-token}
Query: ?format={csv|json}&filters={...}

// Historique pour gestionnaire (scoped)
GET /api/communication/my-history
Authorization: Bearer {manager-token}
Query: ?type={sms|push}&startDate={date}&endDate={date}
```

### Database Schema

#### Table: communication_logs
```sql
CREATE TABLE communication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(20) NOT NULL CHECK (type IN ('sms', 'push', 'email')),
  provider VARCHAR(50), -- 'africas_talking', 'fcm', 'smtp'
  recipient_id UUID REFERENCES users(id),
  recipient_contact VARCHAR(255), -- phone or email
  subject VARCHAR(255), -- for emails
  content TEXT, -- encrypted for sensitive data
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  provider_message_id VARCHAR(100),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  failed_at TIMESTAMP,
  cost DECIMAL(10,4), -- cost in XAF or USD
  metadata JSONB, -- additional provider-specific data
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Partitionnement par mois pour performance
-- CREATE TABLE communication_logs_y2024m01 PARTITION OF communication_logs FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Index pour performance
CREATE INDEX idx_comm_logs_type ON communication_logs(type);
CREATE INDEX idx_comm_logs_status ON communication_logs(status);
CREATE INDEX idx_comm_logs_recipient ON communication_logs(recipient_id);
CREATE INDEX idx_comm_logs_sent_at ON communication_logs(sent_at);
CREATE INDEX idx_comm_logs_provider ON communication_logs(provider);
CREATE INDEX idx_comm_logs_created_at ON communication_logs(created_at);
```

#### Table: communication_metrics
```sql
CREATE TABLE communication_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  type VARCHAR(20) NOT NULL,
  provider VARCHAR(50),
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_failed INTEGER DEFAULT 0,
  success_rate DECIMAL(5,2), -- percentage
  average_cost DECIMAL(10,4),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, type, provider)
);

-- Index pour performance
CREATE INDEX idx_metrics_date ON communication_metrics(date);
CREATE INDEX idx_metrics_type ON communication_metrics(type);
```

### Backend Implementation

#### Service Logs de Communication
```typescript
// src/modules/admin/communication-logs.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { CommunicationLog } from './entities/communication-log.entity';
import { CommunicationMetric } from './entities/communication-metric.entity';

@Injectable()
export class CommunicationLogsService {
  private readonly logger = new Logger(CommunicationLogsService.name);

  constructor(
    @InjectRepository(CommunicationLog)
    private logsRepository: Repository<CommunicationLog>,
    @InjectRepository(CommunicationMetric)
    private metricsRepository: Repository<CommunicationMetric>,
  ) {}

  async createLog(logData: Partial<CommunicationLog>): Promise<CommunicationLog> {
    // Chiffrement du contenu sensible si nécessaire
    if (logData.content && this.isSensitiveContent(logData.type)) {
      logData.content = await this.encryptContent(logData.content);
    }

    const log = this.logsRepository.create(logData);
    return this.logsRepository.save(log);
  }

  async updateLogStatus(
    id: string, 
    status: string, 
    additionalData?: any
  ): Promise<void> {
    const updateData: any = { 
      status, 
      updated_at: new Date() 
    };

    if (status === 'delivered') {
      updateData.delivered_at = new Date();
    } else if (status === 'failed') {
      updateData.failed_at = new Date();
      if (additionalData?.error) {
        updateData.error_message = additionalData.error;
      }
    }

    await this.logsRepository.update(id, updateData);
    
    // Mettre à jour les métriques
    await this.updateMetrics();
  }

  async getLogs(filters: any, page: number = 1, limit: number = 50): Promise<{
    logs: CommunicationLog[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const query = this.buildLogsQuery(filters);
    
    const [logs, total] = await query
      .orderBy('created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getMetrics(period: string = 'month', type?: string): Promise<any> {
    const date = new Date();
    let startDate: Date;
    let groupBy: string;

    switch (period) {
      case 'day':
        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        groupBy = 'DATE(created_at)';
        break;
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        startDate = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate());
        groupBy = 'DATE_TRUNC(\'week\', created_at)';
        break;
      case 'month':
      default:
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        groupBy = 'DATE_TRUNC(\'month\', created_at)';
        break;
    }

    const query = this.metricsRepository.createQueryBuilder('m')
      .where('m.date >= :startDate', { startDate });

    if (type) {
      query.andWhere('m.type = :type', { type });
    }

    return query
      .select([
        'm.type',
        'SUM(m.total_sent) as total_sent',
        'SUM(m.total_delivered) as total_delivered',
        'SUM(m.total_failed) as total_failed',
        'AVG(m.success_rate) as avg_success_rate',
        'SUM(m.average_cost * m.total_sent) / SUM(m.total_sent) as avg_cost'
      ])
      .groupBy('m.type')
      .getRawMany();
  }

  async exportLogs(filters: any, format: 'csv' | 'json'): Promise<string> {
    const { logs } = await this.getLogs(filters, 1, 10000); // Max 10k pour export
    
    if (format === 'csv') {
      return this.convertToCSV(logs);
    } else {
      return JSON.stringify(logs, null, 2);
    }
  }

  private buildLogsQuery(filters: any): SelectQueryBuilder<CommunicationLog> {
    const query = this.logsRepository.createQueryBuilder('log');

    if (filters.type) {
      query.andWhere('log.type = :type', { type: filters.type });
    }
    if (filters.status) {
      query.andWhere('log.status = :status', { status: filters.status });
    }
    if (filters.recipientId) {
      query.andWhere('log.recipient_id = :recipientId', { recipientId: filters.recipientId });
    }
    if (filters.startDate) {
      query.andWhere('log.created_at >= :startDate', { startDate: filters.startDate });
    }
    if (filters.endDate) {
      query.andWhere('log.created_at <= :endDate', { endDate: filters.endDate });
    }
    if (filters.provider) {
      query.andWhere('log.provider = :provider', { provider: filters.provider });
    }

    return query;
  }

  private async updateMetrics(): Promise<void> {
    // Mise à jour quotidienne des métriques
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculer métriques par type et provider
    const metrics = await this.logsRepository
      .createQueryBuilder('log')
      .select([
        'log.type',
        'log.provider',
        'COUNT(*) as total',
        'COUNT(CASE WHEN log.status = \'delivered\' THEN 1 END) as delivered',
        'COUNT(CASE WHEN log.status = \'failed\' THEN 1 END) as failed',
        'AVG(log.cost) as avg_cost'
      ])
      .where('log.created_at >= :startDate', { startDate: today })
      .andWhere('log.created_at < :endDate', { endDate: tomorrow })
      .groupBy('log.type, log.provider')
      .getRawMany();

    for (const metric of metrics) {
      const successRate = metric.total > 0 ? (metric.delivered / metric.total) * 100 : 0;

      await this.metricsRepository.upsert({
        date: today,
        type: metric.type,
        provider: metric.provider,
        total_sent: parseInt(metric.total),
        total_delivered: parseInt(metric.delivered),
        total_failed: parseInt(metric.failed),
        success_rate: Math.round(successRate * 100) / 100,
        average_cost: parseFloat(metric.avg_cost) || 0
      }, ['date', 'type', 'provider']);
    }
  }

  private isSensitiveContent(type: string): boolean {
    return ['sms', 'email'].includes(type);
  }

  private async encryptContent(content: string): Promise<string> {
    // Implémentation du chiffrement AES-256
    // Utiliser une clé dérivée du secret d'application
    return content; // Placeholder - implémentation réelle requise
  }

  private convertToCSV(logs: CommunicationLog[]): string {
    const headers = [
      'ID', 'Type', 'Provider', 'Recipient', 'Status', 'Sent At', 'Delivered At', 'Cost', 'Error'
    ];
    
    const rows = logs.map(log => [
      log.id,
      log.type,
      log.provider,
      log.recipient_contact,
      log.status,
      log.sent_at?.toISOString(),
      log.delivered_at?.toISOString(),
      log.cost?.toString(),
      log.error_message
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field || ''}"`).join(','))
      .join('\n');
  }
}
```

#### Contrôleur Admin
```typescript
// src/modules/admin/communication-logs.controller.ts
import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/admin.guard';
import { CommunicationLogsService } from './communication-logs.service';

@Controller('admin/communication-logs')
@UseGuards(AdminGuard)
export class CommunicationLogsController {
  constructor(private readonly logsService: CommunicationLogsService) {}

  @Get()
  async getLogs(
    @Query() filters: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50
  ) {
    return this.logsService.getLogs(filters, page, limit);
  }

  @Get('export')
  async exportLogs(@Query() filters: any, @Query('format') format: 'csv' | 'json' = 'csv') {
    const data = await this.logsService.exportLogs(filters, format);
    return {
      data,
      filename: `communication-logs-${new Date().toISOString().split('T')[0]}.${format}`
    };
  }

  @Get('metrics')
  async getMetrics(@Query('period') period: string, @Query('type') type?: string) {
    return this.logsService.getMetrics(period, type);
  }
}
```

### Mobile/Web Implementation

#### Interface d'Administration (React)
```typescript
// src/components/admin/CommunicationLogs.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Chip, Searchbar, Menu } from 'react-native-paper';
import { api } from '../../services/api';

export const CommunicationLogs: React.FC = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/communication-logs', { params: filters });
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'green';
      case 'sent': return 'blue';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  const exportLogs = async (format: 'csv' | 'json') => {
    try {
      const response = await api.get('/admin/communication-logs/export', {
        params: { ...filters, format }
      });
      
      // Télécharger le fichier
      const blob = new Blob([response.data.data], { 
        type: format === 'csv' ? 'text/csv' : 'application/json' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Searchbar
          placeholder="Rechercher..."
          value={filters.search}
          onChangeText={(text) => setFilters({...filters, search: text})}
          style={styles.search}
        />
        
        <Menu
          visible={false}
          onDismiss={() => {}}
          anchor={<Text>Type: {filters.type || 'Tous'}</Text>}
        >
          {/* Menu items pour filtrer par type */}
        </Menu>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadLogs}
        renderItem={({ item }) => (
          <Card style={styles.logCard}>
            <Card.Content>
              <View style={styles.header}>
                <Text style={styles.type}>{item.type.toUpperCase()}</Text>
                <Chip mode="outlined" textStyle={{ color: getStatusColor(item.status) }}>
                  {item.status}
                </Chip>
              </View>
              
              <Text style={styles.recipient}>{item.recipient_contact}</Text>
              <Text style={styles.timestamp}>
                {new Date(item.created_at).toLocaleString('fr-FR')}
              </Text>
              
              {item.error_message && (
                <Text style={styles.error}>{item.error_message}</Text>
              )}
            </Card.Content>
          </Card>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  filters: { marginBottom: 16 },
  search: { marginBottom: 8 },
  logCard: { marginBottom: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { fontWeight: 'bold', fontSize: 12 },
  recipient: { fontSize: 14, marginVertical: 4 },
  timestamp: { fontSize: 12, color: 'gray' },
  error: { fontSize: 12, color: 'red', marginTop: 4 }
});
```

### Testing Strategy

#### Unit Tests
```typescript
// src/modules/admin/communication-logs.service.spec.ts
describe('CommunicationLogsService', () => {
  it('should create communication log', async () => {
    // Test création log
  });

  it('should update log status', async () => {
    // Test mise à jour statut
  });

  it('should filter logs correctly', async () => {
    // Test filtrage
  });

  it('should export logs in CSV format', async () => {
    // Test export CSV
  });
});
```

#### Integration Tests
```typescript
describe('Communication Logs Integration', () => {
  it('should log SMS sending', async () => {
    // Test logging SMS
  });

  it('should update metrics after log creation', async () => {
    // Test mise à jour métriques
  });
});
```

### Implementation Checklist
- [ ] Création tables communication_logs et communication_metrics
- [ ] Implémentation CommunicationLogsService
- [ ] API endpoints admin pour logs et métriques
- [ ] Chiffrement du contenu sensible
- [ ] Interface admin pour consulter les logs
- [ ] Filtres et recherche
- [ ] Export CSV/JSON
- [ ] Mise à jour automatique des métriques
- [ ] Tests unitaires et d'intégration
- [ ] Archivage automatique des anciens logs
- [ ] Audit logging pour actions admin

### Dependencies
- TypeORM pour base de données
- crypto pour chiffrement
- csv-writer pour export CSV
- NestJS pour API

### Risks & Mitigations
- **Risque**: Logs volumineux impactant performance
  - **Mitigation**: Partitionnement + archivage automatique
- **Risque**: Données sensibles dans les logs
  - **Mitigation**: Chiffrement AES-256 des contenus sensibles
- **Risque**: Perte de logs critiques
  - **Mitigation**: Backup régulier + redondance

### Performance Considerations
- Partitionnement mensuel des tables
- Index composites pour requêtes fréquentes
- Cache pour métriques fréquemment consultées
- Async processing pour exports volumineux
- Cleanup automatique des logs anciens