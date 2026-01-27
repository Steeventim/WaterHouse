# Story 6-2: Notifications Push

## Story Header
- **Story ID**: 6-2
- **Key**: WH-6-2
- **Epic**: Epic 6 - Envoi et Communication
- **Title**: Notifications Push
- **Status**: Ready for Dev
- **Assignee**: TBD
- **Created Date**: 2026-01-26
- **Updated Date**: 2026-01-26
- **Story Points**: 8

## User Story
En tant que **releveur**, je veux **recevoir des notifications push** afin que **je sois informé des nouvelles tâches de relevé assignées**.

En tant que **gestionnaire d'immeuble**, je veux **recevoir des notifications push pour les événements importants** afin que **je reste informé du statut des relevés et factures**.

En tant que **locataire**, je veux **recevoir des notifications push pour mes factures** afin que **je ne rate pas les échéances de paiement**.

## Acceptance Criteria
### Fonctionnel
- [ ] Notifications push pour nouvelles tâches de relevé
- [ ] Notifications push pour factures générées
- [ ] Notifications push pour rappels de paiement
- [ ] Notifications push pour statuts de synchronisation
- [ ] Gestion des préférences de notification par utilisateur
- [ ] Historique des notifications consultable
- [ ] Deep linking vers l'écran approprié depuis la notification

### Non-Fonctionnel
- [ ] Délai de livraison < 30 secondes
- [ ] Support iOS et Android
- [ ] Gestion offline (stockage local des notifications)
- [ ] Respect des paramètres de confidentialité
- [ ] Analytics des taux d'ouverture

## Technical Requirements

### Architecture Context
- **Bounded Context**: Communication & User Experience
- **Integration Points**: Firebase Cloud Messaging (FCM), APNs, Backend API
- **Security**: Gestion sécurisée des tokens de device
- **Performance**: Background processing, battery optimization

### API Endpoints

#### Backend (NestJS)
```typescript
// Enregistrement token device
POST /api/notifications/register-device
Authorization: Bearer {token}
Content-Type: application/json

{
  "deviceToken": "fcm_token_or_apns_token",
  "platform": "ios|android",
  "appVersion": "1.0.0"
}

// Envoi notification push
POST /api/notifications/send
Authorization: Bearer {token}
Content-Type: application/json

{
  "userIds": ["uuid1", "uuid2"],
  "title": "Nouvelle facture disponible",
  "body": "Votre facture de décembre est prête",
  "data": {
    "type": "invoice",
    "invoiceId": "uuid",
    "action": "view_invoice"
  }
}

// Préférences notifications
GET /api/notifications/preferences
PUT /api/notifications/preferences
Authorization: Bearer {token}

// Historique notifications
GET /api/notifications/history
Query: ?page={number}&limit={number}&read={true|false}
Authorization: Bearer {token}
```

#### Mobile (React Native)
```typescript
// Service Notifications
interface NotificationService {
  registerDevice(): Promise<void>;
  sendNotification(userId: string, notification: NotificationData): Promise<void>;
  getNotificationHistory(): Promise<Notification[]>;
  updatePreferences(preferences: NotificationPreferences): Promise<void>;
}

interface NotificationData {
  title: string;
  body: string;
  data?: any;
}
```

### Database Schema

#### Table: device_tokens
```sql
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  device_token VARCHAR(255) UNIQUE NOT NULL,
  platform VARCHAR(10) NOT NULL CHECK (platform IN ('ios', 'android')),
  app_version VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_device_tokens_user ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_token ON device_tokens(device_token);
CREATE INDEX idx_device_tokens_active ON device_tokens(is_active);
```

#### Table: notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  type VARCHAR(50), -- invoice, reading_task, payment_reminder, sync_status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  sent_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_sent ON notifications(sent_at);
```

#### Table: notification_preferences
```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  invoice_notifications BOOLEAN DEFAULT true,
  reading_task_notifications BOOLEAN DEFAULT true,
  payment_reminder_notifications BOOLEAN DEFAULT true,
  sync_status_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Mobile Implementation

#### Service Notifications (React Native)
```typescript
// src/services/notificationService.ts
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance, AndroidStyle } from '@notifee/react-native';
import { api } from '../api/baseApi';

export interface NotificationPreferences {
  invoiceNotifications: boolean;
  readingTaskNotifications: boolean;
  paymentReminderNotifications: boolean;
  syncStatusNotifications: boolean;
}

export class NotificationService {
  static async registerDevice(): Promise<void> {
    try {
      // Demander permission
      const authStatus = await messaging().requestPermission();
      if (authStatus !== messaging.AuthorizationStatus.AUTHORIZED && 
          authStatus !== messaging.AuthorizationStatus.PROVISIONAL) {
        throw new Error('Permission denied');
      }

      // Obtenir token FCM
      const fcmToken = await messaging().getToken();
      
      // Enregistrer auprès du backend
      await api.post('/notifications/register-device', {
        deviceToken: fcmToken,
        platform: Platform.OS,
        appVersion: '1.0.0'
      });

      // Configurer canal de notification Android
      if (Platform.OS === 'android') {
        await notifee.createChannel({
          id: 'default',
          name: 'Default Channel',
          importance: AndroidImportance.HIGH,
          sound: 'default',
        });
      }
    } catch (error) {
      console.error('Failed to register device:', error);
      throw error;
    }
  }

  static async handleNotificationOpened(): Promise<void> {
    // Gérer l'ouverture de notification
    messaging().onNotificationOpenedApp(async (remoteMessage) => {
      await this.handleNotificationAction(remoteMessage.data);
    });

    // Gérer notification ouverte depuis terminated state
    const initialNotification = await messaging().getInitialNotification();
    if (initialNotification) {
      await this.handleNotificationAction(initialNotification.data);
    }
  }

  private static async handleNotificationAction(data: any): Promise<void> {
    if (!data) return;

    switch (data.type) {
      case 'invoice':
        // Navigation vers écran facture
        navigation.navigate('InvoiceDetail', { invoiceId: data.invoiceId });
        break;
      case 'reading_task':
        // Navigation vers écran tâche de relevé
        navigation.navigate('ReadingTask', { taskId: data.taskId });
        break;
      case 'payment_reminder':
        // Navigation vers écran paiement
        navigation.navigate('Payment', { invoiceId: data.invoiceId });
        break;
    }
  }

  static async displayNotification(remoteMessage: any): Promise<void> {
    if (Platform.OS === 'android') {
      await notifee.displayNotification({
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          style: { type: AndroidStyle.BIGTEXT, text: remoteMessage.notification?.body },
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'default',
        },
      });
    }
  }

  static async getNotificationHistory(): Promise<any[]> {
    const response = await api.get('/notifications/history');
    return response.data;
  }

  static async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    await api.put('/notifications/preferences', preferences);
  }

  static async getPreferences(): Promise<NotificationPreferences> {
    const response = await api.get('/notifications/preferences');
    return response.data;
  }
}
```

#### Configuration Firebase
```typescript
// src/config/firebase.ts
import messaging from '@react-native-firebase/messaging';

export const firebaseConfig = {
  // Configuration Firebase depuis .env
};

// Gestion des messages en background
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

// Gestion des messages en foreground
export const setupForegroundMessages = () => {
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    await NotificationService.displayNotification(remoteMessage);
  });
  return unsubscribe;
};
```

#### Composant Préférences Notifications
```typescript
// src/components/settings/NotificationPreferences.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Switch, Text, Card } from 'react-native-paper';
import { NotificationService, NotificationPreferences } from '../../services/notificationService';

export const NotificationPreferencesScreen: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    invoiceNotifications: true,
    readingTaskNotifications: true,
    paymentReminderNotifications: true,
    syncStatusNotifications: false,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await NotificationService.getPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);
    
    try {
      await NotificationService.updatePreferences(newPreferences);
    } catch (error) {
      // Revert on error
      setPreferences(preferences);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title title="Préférences de Notifications" />
        <Card.Content>
          <View style={styles.preference}>
            <Text>Notifications de factures</Text>
            <Switch
              value={preferences.invoiceNotifications}
              onValueChange={(value) => updatePreference('invoiceNotifications', value)}
            />
          </View>
          
          <View style={styles.preference}>
            <Text>Nouvelles tâches de relevé</Text>
            <Switch
              value={preferences.readingTaskNotifications}
              onValueChange={(value) => updatePreference('readingTaskNotifications', value)}
            />
          </View>
          
          <View style={styles.preference}>
            <Text>Rappels de paiement</Text>
            <Switch
              value={preferences.paymentReminderNotifications}
              onValueChange={(value) => updatePreference('paymentReminderNotifications', value)}
            />
          </View>
          
          <View style={styles.preference}>
            <Text>Statut de synchronisation</Text>
            <Switch
              value={preferences.syncStatusNotifications}
              onValueChange={(value) => updatePreference('syncStatusNotifications', value)}
            />
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { marginBottom: 16 },
  preference: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingVertical: 8 
  }
});
```

### Backend Implementation

#### Service Notifications (NestJS)
```typescript
// src/modules/notifications/notifications.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceToken } from './entities/device-token.entity';
import { Notification } from './entities/notification.entity';
import { FcmService } from '../../integrations/fcm/fcm.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(DeviceToken)
    private deviceTokenRepository: Repository<DeviceToken>,
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private fcmService: FcmService,
  ) {}

  async registerDevice(
    userId: string,
    deviceToken: string,
    platform: string,
    appVersion: string
  ): Promise<void> {
    // Désactiver anciens tokens pour ce device
    await this.deviceTokenRepository.update(
      { device_token: deviceToken },
      { is_active: false }
    );

    // Créer nouveau token
    const token = this.deviceTokenRepository.create({
      user_id: userId,
      device_token: deviceToken,
      platform,
      app_version: appVersion,
      is_active: true,
      last_used_at: new Date()
    });

    await this.deviceTokenRepository.save(token);
  }

  async sendNotification(
    userIds: string[],
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    for (const userId of userIds) {
      try {
        // Récupérer tokens actifs de l'utilisateur
        const deviceTokens = await this.deviceTokenRepository.find({
          where: { user_id: userId, is_active: true }
        });

        if (deviceTokens.length === 0) continue;

        // Créer notification en base
        const notification = this.notificationRepository.create({
          user_id: userId,
          title,
          body,
          data,
          type: data?.type || 'general'
        });
        await this.notificationRepository.save(notification);

        // Envoyer via FCM
        const tokens = deviceTokens.map(dt => dt.device_token);
        await this.fcmService.sendMulticast({
          tokens,
          notification: { title, body },
          data
        });

        // Marquer comme envoyé
        notification.sent_at = new Date();
        await this.notificationRepository.save(notification);

      } catch (error) {
        this.logger.error(`Failed to send notification to user ${userId}:`, error);
      }
    }
  }

  async getNotificationHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
    read?: boolean
  ): Promise<Notification[]> {
    const query = this.notificationRepository.createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.created_at', 'DESC')
      .limit(limit)
      .offset((page - 1) * limit);

    if (read !== undefined) {
      query.andWhere('n.is_read = :read', { read });
    }

    return query.getMany();
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await this.notificationRepository.update(
      { id: notificationId, user_id: userId },
      { is_read: true, read_at: new Date() }
    );
  }
}
```

#### Service FCM
```typescript
// src/integrations/fcm/fcm.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FcmService {
  private readonly logger = new Logger(FcmService.name);

  constructor() {
    // Initialiser Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
    }
  }

  async sendMulticast(message: admin.messaging.MulticastMessage): Promise<void> {
    try {
      const response = await admin.messaging().sendMulticast(message);
      
      this.logger.log(`Successfully sent ${response.successCount} notifications`);
      
      if (response.failureCount > 0) {
        this.logger.warn(`${response.failureCount} notifications failed`);
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            this.logger.error(`Failed to send to token ${message.tokens?.[idx]}:`, resp.error);
          }
        });
      }
    } catch (error) {
      this.logger.error('FCM send error:', error);
      throw error;
    }
  }

  async sendToToken(token: string, message: admin.messaging.Message): Promise<void> {
    try {
      await admin.messaging().send({ ...message, token });
    } catch (error) {
      this.logger.error(`Failed to send to token ${token}:`, error);
      throw error;
    }
  }
}
```

### Testing Strategy

#### Unit Tests
```typescript
// src/modules/notifications/notifications.service.spec.ts
describe('NotificationsService', () => {
  let service: NotificationsService;
  let deviceTokenRepository: MockType<Repository<DeviceToken>>;
  let notificationRepository: MockType<Repository<Notification>>;
  let fcmService: MockType<FcmService>;

  beforeEach(async () => {
    // Setup mocks
  });

  it('should register device token', async () => {
    // Test enregistrement token
  });

  it('should send notification to user', async () => {
    // Test envoi notification
  });

  it('should handle FCM failures gracefully', async () => {
    // Test gestion erreurs FCM
  });
});
```

#### Integration Tests
```typescript
// Test end-to-end notifications
describe('Notification Integration', () => {
  it('should send push notification on invoice generation', async () => {
    // Test notification facture
  });

  it('should handle device token registration', async () => {
    // Test enregistrement device
  });
});
```

#### E2E Tests (Playwright - Web Version)
```typescript
// e2e/notifications.spec.ts
test('User can manage notification preferences', async ({ page }) => {
  // Test interface web préférences notifications
});
```

### Implementation Checklist
- [ ] Configuration Firebase/FCM
- [ ] Création tables device_tokens, notifications, notification_preferences
- [ ] Implémentation NotificationsService backend
- [ ] Service FCM pour envoi
- [ ] API endpoints pour registration et envoi
- [ ] Service notifications mobile
- [ ] Gestion permissions et tokens
- [ ] Composant préférences notifications
- [ ] Deep linking depuis notifications
- [ ] Tests unitaires et d'intégration
- [ ] Gestion des erreurs et retry
- [ ] Analytics et monitoring

### Dependencies
- @react-native-firebase/messaging
- @notifee/react-native
- firebase-admin (backend)
- TypeORM pour base de données

### Risks & Mitigations
- **Risque**: Tokens expirés ou invalides
  - **Mitigation**: Nettoyage périodique + gestion erreurs FCM
- **Risque**: Batterie et performance mobile
  - **Mitigation**: Optimisation background + batch notifications
- **Risque**: Spam notifications
  - **Mitigation**: Rate limiting + préférences utilisateur

### Performance Considerations
- Batch processing pour envoi multiple
- Index database optimisés
- Cache des tokens actifs
- Cleanup périodique des anciens tokens
- Optimisation mémoire mobile