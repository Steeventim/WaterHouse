# Story 7-3: Génération de Rapports

## Story Header
- **Story ID**: 7-3
- **Key**: WH-7-3
- **Epic**: Epic 7 - Interface Web de Gestion
- **Title**: Génération de Rapports
- **Status**: Ready for Dev
- **Assignee**: TBD
- **Created Date**: 2026-01-26
- **Updated Date**: 2026-01-26
- **Story Points**: 8

## User Story
En tant que **gestionnaire d'immeuble**, je veux **générer des rapports de consommation d'eau** afin que **je puisse analyser les tendances et identifier les anomalies**.

En tant que **gestionnaire d'immeuble**, je veux **exporter les rapports en PDF** afin que **je puisse les partager avec les propriétaires et les autorités**.

## Acceptance Criteria
### Fonctionnel
- [ ] Rapport de consommation par appartement/période
- [ ] Rapport de validation des relevés
- [ ] Graphiques de tendances de consommation
- [ ] Détection automatique d'anomalies
- [ ] Export PDF avec mise en page professionnelle
- [ ] Filtres par date, immeuble, appartement
- [ ] Programmation de rapports récurrents

### Non-Fonctionnel
- [ ] Génération PDF < 30 secondes
- [ ] Support des rapports volumineux
- [ ] Mise en cache des rapports fréquents
- [ ] Interface responsive

## Technical Requirements

### Architecture Context
- **Bounded Context**: Management & Analytics
- **Integration Points**: Reading Service, Billing Service, PDF Generation
- **Security**: Accès limité aux données de ses immeubles
- **Performance**: Background processing pour gros rapports

### API Endpoints

#### Backend (NestJS)
```typescript
// Génération rapport consommation
POST /api/reports/consumption
Authorization: Bearer {manager-token}
Content-Type: application/json

{
  "buildingId": "uuid",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "groupBy": "apartment|month",
  "includeCharts": true,
  "format": "pdf|json|csv"
}

// Rapport validation relevés
POST /api/reports/reading-validation
Authorization: Bearer {manager-token}

// Statut génération rapport
GET /api/reports/{reportId}/status
Authorization: Bearer {manager-token}

// Téléchargement rapport
GET /api/reports/{reportId}/download
Authorization: Bearer {manager-token}

// Rapports programmés
GET /api/reports/scheduled
POST /api/reports/scheduled
DELETE /api/reports/scheduled/{id}
Authorization: Bearer {manager-token}
```

### Database Schema

#### Table: reports
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- consumption, validation, billing
  status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  parameters JSONB, -- Paramètres de génération
  file_url VARCHAR(500),
  file_size INTEGER,
  generated_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at);
```

#### Table: scheduled_reports
```sql
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  parameters JSONB,
  schedule_cron VARCHAR(100) NOT NULL, -- Expression cron
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP,
  next_run TIMESTAMP,
  recipients JSONB, -- Liste des emails pour envoi automatique
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_scheduled_reports_user ON scheduled_reports(user_id);
CREATE INDEX idx_scheduled_reports_next_run ON scheduled_reports(next_run);
```

### Web Implementation (React)

#### Composant Générateur de Rapports
```typescript
// src/components/reports/ReportGenerator.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, TextInput, Checkbox, RadioButton, DatePicker, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

interface ReportConfig {
  type: 'consumption' | 'validation' | 'billing';
  buildingId: string;
  startDate: Date;
  endDate: Date;
  groupBy: 'apartment' | 'month';
  includeCharts: boolean;
  format: 'pdf' | 'json' | 'csv';
}

export const ReportGenerator: React.FC = () => {
  const [config, setConfig] = useState<ReportConfig>({
    type: 'consumption',
    buildingId: '',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 jours
    endDate: new Date(),
    groupBy: 'apartment',
    includeCharts: true,
    format: 'pdf'
  });
  const [buildings, setBuildings] = useState([]);
  const [generating, setGenerating] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      const response = await api.get('/buildings/managed');
      setBuildings(response.data);
    } catch (error) {
      console.error('Failed to load buildings:', error);
    }
  };

  const generateReport = async () => {
    if (!config.buildingId) {
      alert('Veuillez sélectionner un immeuble');
      return;
    }

    setGenerating(true);
    try {
      const response = await api.post('/reports/consumption', {
        ...config,
        startDate: config.startDate.toISOString().split('T')[0],
        endDate: config.endDate.toISOString().split('T')[0]
      });

      // Rediriger vers la page de statut
      navigation.navigate('ReportStatus', { reportId: response.data.reportId });
    } catch (error) {
      console.error('Report generation failed:', error);
      alert('Erreur lors de la génération du rapport');
    } finally {
      setGenerating(false);
    }
  };

  const reportTypes = [
    { label: 'Consommation d\'eau', value: 'consumption' },
    { label: 'Validation des relevés', value: 'validation' },
    { label: 'Facturation', value: 'billing' }
  ];

  const formats = [
    { label: 'PDF', value: 'pdf' },
    { label: 'JSON', value: 'json' },
    { label: 'CSV', value: 'csv' }
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Générer un Rapport" />
        <Card.Content>
          {/* Type de rapport */}
          <Text style={styles.sectionTitle}>Type de rapport</Text>
          <RadioButton.Group 
            onValueChange={(value) => setConfig({...config, type: value as any})}
            value={config.type}
          >
            {reportTypes.map((type) => (
              <View key={type.value} style={styles.radioOption}>
                <RadioButton value={type.value} />
                <Text>{type.label}</Text>
              </View>
            ))}
          </RadioButton.Group>

          {/* Sélection immeuble */}
          <Text style={styles.sectionTitle}>Immeuble</Text>
          <Picker
            selectedValue={config.buildingId}
            onValueChange={(value) => setConfig({...config, buildingId: value})}
            style={styles.picker}
          >
            <Picker.Item label="Sélectionner un immeuble..." value="" />
            {buildings.map((building) => (
              <Picker.Item 
                key={building.id} 
                label={building.name} 
                value={building.id} 
              />
            ))}
          </Picker>

          {/* Période */}
          <Text style={styles.sectionTitle}>Période</Text>
          <View style={styles.dateContainer}>
            <DatePicker
              label="Date de début"
              value={config.startDate}
              onChange={(date) => setConfig({...config, startDate: date})}
              style={styles.datePicker}
            />
            <DatePicker
              label="Date de fin"
              value={config.endDate}
              onChange={(date) => setConfig({...config, endDate: date})}
              style={styles.datePicker}
            />
          </View>

          {/* Options */}
          <Text style={styles.sectionTitle}>Options</Text>
          
          <View style={styles.checkboxContainer}>
            <Checkbox
              status={config.includeCharts ? 'checked' : 'unchecked'}
              onPress={() => setConfig({...config, includeCharts: !config.includeCharts})}
            />
            <Text style={styles.checkboxLabel}>Inclure les graphiques</Text>
          </View>

          <Text style={styles.subSectionTitle}>Regrouper par:</Text>
          <RadioButton.Group 
            onValueChange={(value) => setConfig({...config, groupBy: value as any})}
            value={config.groupBy}
          >
            <View style={styles.radioOption}>
              <RadioButton value="apartment" />
              <Text>Appartement</Text>
            </View>
            <View style={styles.radioOption}>
              <RadioButton value="month" />
              <Text>Mois</Text>
            </View>
          </RadioButton.Group>

          {/* Format */}
          <Text style={styles.sectionTitle}>Format d'export</Text>
          <RadioButton.Group 
            onValueChange={(value) => setConfig({...config, format: value as any})}
            value={config.format}
          >
            {formats.map((format) => (
              <View key={format.value} style={styles.radioOption}>
                <RadioButton value={format.value} />
                <Text>{format.label}</Text>
              </View>
            ))}
          </RadioButton.Group>

          {/* Bouton génération */}
          <Button
            mode="contained"
            onPress={generateReport}
            loading={generating}
            disabled={generating}
            style={styles.generateButton}
          >
            {generating ? 'Génération en cours...' : 'Générer le rapport'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  card: { margin: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  subSectionTitle: { fontSize: 14, fontWeight: '500', marginTop: 8, marginBottom: 4 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  picker: { backgroundColor: 'white', marginBottom: 16 },
  dateContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  datePicker: { flex: 1, marginHorizontal: 4 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  checkboxLabel: { marginLeft: 8 },
  generateButton: { marginTop: 24 }
});
```

#### Composant Statut et Téléchargement
```typescript
// src/components/reports/ReportStatus.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Card, Text, Button, ProgressBar, Chip } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { api } from '../../services/api';

type ReportStatusRouteProp = RouteProp<{ ReportStatus: { reportId: string } }, 'ReportStatus'>;

interface Props {
  route: ReportStatusRouteProp;
}

export const ReportStatus: React.FC<Props> = ({ route }) => {
  const { reportId } = route.params;
  const [report, setReport] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadReportStatus();
    // Poll for status updates
    const interval = setInterval(loadReportStatus, 2000);
    return () => clearInterval(interval);
  }, [reportId]);

  const loadReportStatus = async () => {
    try {
      const response = await api.get(`/reports/${reportId}/status`);
      setReport(response.data);
      
      // Arrêter le polling si terminé
      if (response.data.status === 'completed' || response.data.status === 'failed') {
        // Clear interval logic would go here
      }
    } catch (error) {
      console.error('Failed to load report status:', error);
    }
  };

  const downloadReport = async () => {
    if (!report.file_url) return;

    setDownloading(true);
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        responseType: 'blob'
      });
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-${report.type}-${new Date().toISOString().split('T')[0]}.${report.parameters.format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      Alert.alert('Erreur', 'Impossible de télécharger le rapport');
    } finally {
      setDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'processing': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'Génération en cours';
      case 'completed': return 'Terminé';
      case 'failed': return 'Échec';
      default: return status;
    }
  };

  if (!report) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement du statut...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.statusCard}>
        <Card.Title title="Génération du Rapport" />
        <Card.Content>
          <View style={styles.statusHeader}>
            <Text style={styles.reportType}>
              Rapport: {report.type} - {report.parameters.format.toUpperCase()}
            </Text>
            <Chip 
              mode="outlined" 
              textStyle={{ color: getStatusColor(report.status) }}
            >
              {getStatusText(report.status)}
            </Chip>
          </View>

          {report.status === 'processing' && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>Génération en cours...</Text>
              <ProgressBar indeterminate color="#1976d2" style={styles.progressBar} />
            </View>
          )}

          {report.status === 'completed' && (
            <View style={styles.completedContainer}>
              <Text style={styles.completedText}>
                Rapport généré avec succès
              </Text>
              <Text style={styles.fileInfo}>
                Taille: {(report.file_size / 1024).toFixed(1)} KB
              </Text>
              <Text style={styles.generatedAt}>
                Généré le: {new Date(report.generated_at).toLocaleString('fr-FR')}
              </Text>
              
              <Button
                mode="contained"
                onPress={downloadReport}
                loading={downloading}
                disabled={downloading}
                style={styles.downloadButton}
              >
                Télécharger le rapport
              </Button>
            </View>
          )}

          {report.status === 'failed' && (
            <View style={styles.failedContainer}>
              <Text style={styles.failedText}>
                Échec de la génération du rapport
              </Text>
              <Text style={styles.errorText}>
                {report.error_message || 'Erreur inconnue'}
              </Text>
              
              <Button
                mode="outlined"
                onPress={() => navigation.goBack()}
                style={styles.retryButton}
              >
                Retour
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  statusCard: { elevation: 2 },
  statusHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16
  },
  reportType: { fontSize: 16, fontWeight: '500' },
  progressContainer: { alignItems: 'center', marginVertical: 24 },
  progressText: { marginBottom: 16, fontSize: 16 },
  progressBar: { width: '100%', height: 4 },
  completedContainer: { alignItems: 'center', marginVertical: 24 },
  completedText: { fontSize: 18, fontWeight: 'bold', color: 'green', marginBottom: 16 },
  fileInfo: { fontSize: 14, color: 'gray', marginBottom: 8 },
  generatedAt: { fontSize: 14, color: 'gray', marginBottom: 24 },
  downloadButton: { width: '100%' },
  failedContainer: { alignItems: 'center', marginVertical: 24 },
  failedText: { fontSize: 18, fontWeight: 'bold', color: 'red', marginBottom: 16 },
  errorText: { fontSize: 14, color: 'gray', marginBottom: 24, textAlign: 'center' },
  retryButton: { width: '100%' }
});
```

### Backend Implementation

#### Service Rapports
```typescript
// src/modules/reports/reports.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './entities/report.entity';
import { ScheduledReport } from './entities/scheduled-report.entity';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PdfService } from '../../integrations/pdf/pdf.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    @InjectRepository(Report)
    private reportRepository: Repository<Report>,
    @InjectRepository(ScheduledReport)
    private scheduledReportRepository: Repository<ScheduledReport>,
    @InjectQueue('report-generation')
    private reportQueue: Queue,
    private pdfService: PdfService,
  ) {}

  async generateConsumptionReport(
    userId: string, 
    parameters: any
  ): Promise<string> {
    // Créer l'entrée rapport
    const report = this.reportRepository.create({
      user_id: userId,
      type: 'consumption',
      parameters,
      status: 'pending'
    });
    await this.reportRepository.save(report);

    // Ajouter à la queue
    await this.reportQueue.add(
      'generate-consumption-report',
      { reportId: report.id },
      { priority: 1 }
    );

    return report.id;
  }

  async processConsumptionReport(job: any): Promise<void> {
    const { reportId } = job.data;
    
    try {
      const report = await this.reportRepository.findOne({ where: { id: reportId } });
      if (!report) return;

      report.status = 'processing';
      await this.reportRepository.save(report);

      // Récupérer les données de consommation
      const consumptionData = await this.getConsumptionData(report.parameters);
      
      // Générer le rapport selon le format
      let fileUrl: string;
      let fileSize: number;

      if (report.parameters.format === 'pdf') {
        const pdfBuffer = await this.pdfService.generateConsumptionReport(consumptionData);
        fileUrl = await this.uploadReportFile(pdfBuffer, `consumption-${reportId}.pdf`);
        fileSize = pdfBuffer.length;
      } else if (report.parameters.format === 'json') {
        const jsonData = JSON.stringify(consumptionData, null, 2);
        fileUrl = await this.uploadReportFile(Buffer.from(jsonData), `consumption-${reportId}.json`);
        fileSize = jsonData.length;
      } else {
        // CSV format
        const csvData = this.convertToCSV(consumptionData);
        fileUrl = await this.uploadReportFile(Buffer.from(csvData), `consumption-${reportId}.csv`);
        fileSize = csvData.length;
      }

      // Mettre à jour le rapport
      report.status = 'completed';
      report.file_url = fileUrl;
      report.file_size = fileSize;
      report.generated_at = new Date();
      report.expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours

      await this.reportRepository.save(report);

      this.logger.log(`Report ${reportId} generated successfully`);
    } catch (error) {
      this.logger.error(`Failed to generate report ${reportId}:`, error);
      
      const report = await this.reportRepository.findOne({ where: { id: reportId } });
      if (report) {
        report.status = 'failed';
        await this.reportRepository.save(report);
      }
    }
  }

  private async getConsumptionData(parameters: any): Promise<any> {
    // Récupérer les données de consommation depuis la base
    // Inclure les calculs de tendances et anomalies
    const { buildingId, startDate, endDate, groupBy } = parameters;

    // Query pour récupérer les relevés validés
    const readings = await this.readingRepository
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.meter', 'm')
      .leftJoinAndSelect('m.apartment', 'a')
      .where('a.building_id = :buildingId', { buildingId })
      .andWhere('r.validated_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('r.validation_status = :status', { status: 'validated' })
      .orderBy('r.validated_at', 'ASC')
      .getMany();

    // Grouper et calculer les métriques
    const groupedData = this.groupConsumptionData(readings, groupBy);
    const trends = this.calculateTrends(groupedData);
    const anomalies = this.detectAnomalies(groupedData);

    return {
      buildingId,
      period: { startDate, endDate },
      data: groupedData,
      trends,
      anomalies,
      summary: this.calculateSummary(groupedData)
    };
  }

  private groupConsumptionData(readings: any[], groupBy: string): any {
    // Grouper par appartement ou mois
    const grouped = {};

    readings.forEach(reading => {
      const key = groupBy === 'apartment' 
        ? reading.meter.apartment.apartment_number
        : reading.validated_at.substring(0, 7); // YYYY-MM

      if (!grouped[key]) {
        grouped[key] = {
          label: key,
          readings: [],
          totalConsumption: 0,
          averageConsumption: 0
        };
      }

      grouped[key].readings.push(reading);
      grouped[key].totalConsumption += reading.consumption;
    });

    // Calculer les moyennes
    Object.values(grouped).forEach((group: any) => {
      group.averageConsumption = group.totalConsumption / group.readings.length;
    });

    return grouped;
  }

  private calculateTrends(data: any): any {
    // Calculer les tendances (évolution mois par mois)
    const trends = [];
    const sortedKeys = Object.keys(data).sort();

    for (let i = 1; i < sortedKeys.length; i++) {
      const current = data[sortedKeys[i]];
      const previous = data[sortedKeys[i - 1]];
      
      const change = ((current.totalConsumption - previous.totalConsumption) / previous.totalConsumption) * 100;
      
      trends.push({
        period: sortedKeys[i],
        change: Math.round(change * 100) / 100,
        trend: change > 0 ? 'increase' : change < 0 ? 'decrease' : 'stable'
      });
    }

    return trends;
  }

  private detectAnomalies(data: any): any[] {
    // Détecter les anomalies (consommation anormalement haute/basse)
    const anomalies = [];
    const values = Object.values(data).map((group: any) => group.averageConsumption);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

    Object.entries(data).forEach(([key, group]: [string, any]) => {
      const deviation = Math.abs(group.averageConsumption - mean) / stdDev;
      
      if (deviation > 2) { // 2 écarts-types
        anomalies.push({
          period: key,
          consumption: group.averageConsumption,
          deviation: Math.round(deviation * 100) / 100,
          type: group.averageConsumption > mean ? 'high' : 'low'
        });
      }
    });

    return anomalies;
  }

  private calculateSummary(data: any): any {
    const totals = Object.values(data);
    const totalConsumption = totals.reduce((sum: number, group: any) => sum + group.totalConsumption, 0);
    const averageConsumption = totalConsumption / totals.length;

    return {
      totalApartments: Object.keys(data).length,
      totalConsumption: Math.round(totalConsumption * 100) / 100,
      averageConsumption: Math.round(averageConsumption * 100) / 100,
      periodCount: totals.length
    };
  }

  private convertToCSV(data: any): string {
    // Convertir les données en CSV
    const headers = ['Période', 'Consommation Totale', 'Consommation Moyenne', 'Nombre Relevés'];
    const rows = Object.entries(data).map(([key, group]: [string, any]) => [
      key,
      group.totalConsumption,
      group.averageConsumption,
      group.readings.length
    ]);

    return [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
  }

  private async uploadReportFile(buffer: Buffer, filename: string): Promise<string> {
    // Upload vers Supabase ou autre stockage
    // Retourner l'URL du fichier
    return `https://storage.example.com/reports/${filename}`;
  }
}
```

### Testing Strategy

#### Unit Tests
```typescript
// src/modules/reports/reports.service.spec.ts
describe('ReportsService', () => {
  it('should generate consumption report', async () => {
    // Test génération rapport
  });

  it('should detect consumption anomalies', async () => {
    // Test détection anomalies
  });

  it('should calculate consumption trends', async () => {
    // Test calcul tendances
  });
});
```

#### E2E Tests (Playwright)
```typescript
// e2e/report-generation.spec.ts
test('Manager can generate consumption report', async ({ page }) => {
  // Test génération rapport
});

test('Report download works correctly', async ({ page }) => {
  // Test téléchargement
});
```

### Implementation Checklist
- [ ] Service Reports avec génération PDF/JSON/CSV
- [ ] API endpoints pour génération et téléchargement
- [ ] Composant ReportGenerator avec filtres
- [ ] Composant ReportStatus avec progression
- [ ] Calcul automatique des tendances
- [ ] Détection d'anomalies
- [ ] Background processing avec queue
- [ ] Tests unitaires et E2E
- [ ] Mise en cache des rapports

### Dependencies
- Bull pour queue processing
- PDF generation library (Puppeteer ou PDFKit)
- Chart.js pour graphiques
- Supabase pour stockage fichiers

### Risks & Mitigations
- **Risque**: Génération rapports lents pour gros volumes
  - **Mitigation**: Background processing + pagination
- **Risque**: Données sensibles dans rapports
  - **Mitigation**: Chiffrement + contrôle d'accès strict
- **Risque**: Échec génération PDF
  - **Mitigation**: Retry automatique + fallback formats

### Performance Considerations
- Cache des rapports fréquemment générés
- Background processing pour éviter timeout
- Pagination pour gros datasets
- Compression des fichiers générés
- Cleanup automatique des anciens rapports