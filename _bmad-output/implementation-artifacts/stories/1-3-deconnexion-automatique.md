---
story_id: "1.3"
story_key: "1-3-deconnexion-automatique"
epic: "Epic 1: Authentification et Accès Sécurisé"
title: "Déconnexion automatique"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 1.3: Déconnexion automatique

## User Story

**As a** system administrator,
**I want** users to be automatically logged out after 30 minutes of inactivity,
**So that** security is maintained and unauthorized access is prevented.

## Acceptance Criteria

**Given** User is logged in
**When** 30 minutes pass without activity
**Then** User is automatically logged out
**And** Next access requires re-authentication

## Technical Requirements

### Functional Requirements

- **REQ-AUTH-003**: Déconnexion automatique après 30 minutes d'inactivité
- **REQ-SEC-003**: Accès basé sur les rôles (releveur, gestionnaire, admin)

### Non-Functional Requirements

- **REQ-SEC-001**: Chiffrement AES-256 des données sensibles
- **REQ-SEC-004**: Audit logs de toutes les opérations sensibles

## Technical Design

### Architecture Context

**Bounded Context**: Auth
**Module**: apps/api/src/modules/auth/
**Mobile Feature**: apps/mobile/src/features/auth/

### Activity Tracking System

#### Activity Types

```typescript
enum ActivityType {
  USER_INTERACTION = "user_interaction",
  API_CALL = "api_call",
  SCREEN_VIEW = "screen_view",
  DATA_SYNC = "data_sync",
}

interface UserActivity {
  userId: string;
  activityType: ActivityType;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

#### Activity Monitoring Service

```typescript
// services/activityMonitor.ts
export class ActivityMonitor {
  private lastActivity: Date = new Date();
  private readonly TIMEOUT_MINUTES = 30;
  private timeoutId: NodeJS.Timeout | null = null;

  constructor(private onTimeout: () => void) {
    this.startMonitoring();
  }

  recordActivity(activity: UserActivity): void {
    this.lastActivity = new Date();
    this.resetTimeout();
  }

  private startMonitoring(): void {
    this.resetTimeout();
  }

  private resetTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    const timeoutMs = this.TIMEOUT_MINUTES * 60 * 1000;
    this.timeoutId = setTimeout(() => {
      this.checkTimeout();
    }, timeoutMs);
  }

  private checkTimeout(): void {
    const now = new Date();
    const timeSinceLastActivity = now.getTime() - this.lastActivity.getTime();
    const timeoutMs = this.TIMEOUT_MINUTES * 60 * 1000;

    if (timeSinceLastActivity >= timeoutMs) {
      this.onTimeout();
    } else {
      // Recalculate timeout for remaining time
      const remainingMs = timeoutMs - timeSinceLastActivity;
      this.timeoutId = setTimeout(() => {
        this.checkTimeout();
      }, remainingMs);
    }
  }

  destroy(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
```

### Mobile Implementation

#### App-level Activity Tracking

```typescript
// App.tsx
import React, { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from './features/auth/authSlice';
import { ActivityMonitor } from './services/activityMonitor';

const App: React.FC = () => {
  const dispatch = useDispatch();
  const activityMonitorRef = useRef<ActivityMonitor | null>(null);

  useEffect(() => {
    // Initialize activity monitor
    activityMonitorRef.current = new ActivityMonitor(() => {
      dispatch(logout());
    });

    // App state changes (background/foreground)
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
      activityMonitorRef.current?.destroy();
    };
  }, []);

  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      // App came to foreground - record activity
      activityMonitorRef.current?.recordActivity({
        userId: 'current_user_id',
        activityType: ActivityType.SCREEN_VIEW,
        timestamp: new Date(),
        metadata: { appState: 'foreground' }
      });
    }
  };

  const handleUserInteraction = () => {
    activityMonitorRef.current?.recordActivity({
      userId: 'current_user_id',
      activityType: ActivityType.USER_INTERACTION,
      timestamp: new Date(),
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handleUserInteraction}>
      {/* App content */}
    </TouchableWithoutFeedback>
  );
};
```

#### Redux Integration

```typescript
// features/auth/authSlice.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastActivity: Date | null;
  sessionExpiry: Date | null;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    recordActivity: (state) => {
      state.lastActivity = new Date();
      // Extend session expiry
      state.sessionExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.lastActivity = null;
      state.sessionExpiry = null;
    },
    checkSessionExpiry: (state) => {
      if (state.sessionExpiry && new Date() > state.sessionExpiry) {
        // Session expired - logout
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.lastActivity = null;
        state.sessionExpiry = null;
      }
    },
  },
});
```

#### API Activity Tracking

```typescript
// services/apiClient.ts
class ApiClient {
  private activityMonitor: ActivityMonitor;

  constructor(activityMonitor: ActivityMonitor) {
    this.activityMonitor = activityMonitor;
  }

  async request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    // Record API activity
    this.activityMonitor.recordActivity({
      userId: "current_user_id",
      activityType: ActivityType.API_CALL,
      timestamp: new Date(),
      metadata: {
        method: config.method,
        url: config.url,
      },
    });

    return axios.request(config);
  }
}
```

### Background Session Management

#### Background Timer Service

```typescript
// services/backgroundTimer.ts
import BackgroundTimer from "react-native-background-timer";

export class BackgroundSessionManager {
  private intervalId: number | null = null;
  private readonly CHECK_INTERVAL = 60000; // 1 minute

  startSessionMonitoring(onSessionExpired: () => void): void {
    this.intervalId = BackgroundTimer.setInterval(() => {
      // Check session expiry even when app is in background
      const sessionExpiry = this.getSessionExpiry();
      if (sessionExpiry && new Date() > sessionExpiry) {
        onSessionExpired();
        this.stopSessionMonitoring();
      }
    }, this.CHECK_INTERVAL);
  }

  stopSessionMonitoring(): void {
    if (this.intervalId) {
      BackgroundTimer.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private getSessionExpiry(): Date | null {
    // Get from secure storage or Redux state
    return null; // Implementation depends on storage strategy
  }
}
```

### Secure Storage Integration

#### Session Data Storage

```typescript
// services/secureStorage.ts
import * as SecureStore from "expo-secure-store";

export class SessionStorage {
  private static readonly SESSION_EXPIRY_KEY = "session_expiry";
  private static readonly LAST_ACTIVITY_KEY = "last_activity";

  static async setSessionExpiry(expiry: Date): Promise<void> {
    await SecureStore.setItemAsync(
      this.SESSION_EXPIRY_KEY,
      expiry.toISOString(),
    );
  }

  static async getSessionExpiry(): Promise<Date | null> {
    const expiryStr = await SecureStore.getItemAsync(this.SESSION_EXPIRY_KEY);
    return expiryStr ? new Date(expiryStr) : null;
  }

  static async setLastActivity(activity: Date): Promise<void> {
    await SecureStore.setItemAsync(
      this.LAST_ACTIVITY_KEY,
      activity.toISOString(),
    );
  }

  static async getLastActivity(): Promise<Date | null> {
    const activityStr = await SecureStore.getItemAsync(this.LAST_ACTIVITY_KEY);
    return activityStr ? new Date(activityStr) : null;
  }

  static async clearSession(): Promise<void> {
    await SecureStore.deleteItemAsync(this.SESSION_EXPIRY_KEY);
    await SecureStore.deleteItemAsync(this.LAST_ACTIVITY_KEY);
  }
}
```

### Activity Types and Thresholds

#### Configurable Timeouts

```typescript
// config/sessionConfig.ts
export const SESSION_CONFIG = {
  INACTIVITY_TIMEOUT_MINUTES: 30,
  BACKGROUND_CHECK_INTERVAL_SECONDS: 60,
  GRACE_PERIOD_SECONDS: 10, // Grace period before logout
  WARNING_THRESHOLD_MINUTES: 25, // Show warning at 25 minutes
};
```

#### Activity Classification

```typescript
// types/activity.ts
export enum ActivityLevel {
  NONE = 0,
  LOW = 1, // Screen views, navigation
  MEDIUM = 2, // User interactions, form inputs
  HIGH = 3, // API calls, data operations
}

export const ACTIVITY_WEIGHTS: Record<ActivityType, ActivityLevel> = {
  [ActivityType.SCREEN_VIEW]: ActivityLevel.LOW,
  [ActivityType.USER_INTERACTION]: ActivityLevel.MEDIUM,
  [ActivityType.API_CALL]: ActivityLevel.HIGH,
  [ActivityType.DATA_SYNC]: ActivityLevel.HIGH,
};
```

### Warning System

#### Pre-logout Warning

```typescript
// components/SessionWarningModal.tsx
interface SessionWarningModalProps {
  visible: boolean;
  onExtend: () => void;
  onLogout: () => void;
  remainingMinutes: number;
}

export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  visible,
  onExtend,
  onLogout,
  remainingMinutes,
}) => {
  return (
    <Modal visible={visible}>
      <View>
        <Text>Déconnexion automatique dans {remainingMinutes} minutes</Text>
        <Text>Voulez-vous prolonger votre session ?</Text>

        <TouchableOpacity onPress={onExtend}>
          <Text>Prolonger la session</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onLogout}>
          <Text>Se déconnecter maintenant</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};
```

### Testing Strategy

#### Unit Tests

- Activity monitor timeout logic
- Session expiry calculations
- Background timer management
- Secure storage operations

#### Integration Tests

- Complete session lifecycle
- Activity recording across app states
- Background session monitoring
- Warning system integration

#### E2E Tests

- 30-minute inactivity logout
- Background app session expiry
- Session extension via user activity
- Warning modal interactions

### Implementation Checklist

#### Mobile Implementation

- [ ] Activity monitor service
- [ ] Redux session state management
- [ ] App state change handling
- [ ] Background timer integration
- [ ] Secure storage for session data
- [ ] User activity recording hooks
- [ ] Session warning modal
- [ ] API client activity tracking

#### Backend Implementation

- [ ] Session validation middleware
- [ ] Activity logging endpoint
- [ ] Session expiry API
- [ ] Audit logging for security events

#### Testing

- [ ] Unit tests for all timeout logic
- [ ] Integration tests for session management
- [ ] E2E tests for 30-minute timeout
- [ ] Background app testing

### Dependencies

#### Mobile Dependencies

- react-native-background-timer
- expo-secure-store (already included)
- @react-native-async-storage/async-storage (already included)

### Success Criteria

#### Functional Success

- User is automatically logged out after 30 minutes of inactivity
- Session extends when user performs any activity
- Background app sessions are properly monitored
- Clear user feedback before logout

#### Technical Success

- Session monitoring works in foreground and background
- Secure storage prevents session tampering
- Activity tracking is performant and lightweight
- No false logouts due to timing issues

#### Quality Success

- Code coverage > 90% for session management
- All edge cases handled (app kill, background, etc.)
- User experience is smooth and non-intrusive
- Security audit passed

### Definition of Done

- [ ] 30-minute inactivity timeout working
- [ ] Background session monitoring implemented
- [ ] User activity properly extends session
- [ ] Session warning system implemented
- [ ] Secure storage integration complete
- [ ] Unit and integration tests passing
- [ ] E2E tests passing
- [ ] Code reviewed and approved
- [ ] Documentation updated

### Notes for Developer

**Critical Security Feature:**

- This is a core security requirement
- Must work reliably in all app states
- No way to bypass or extend indefinitely
- Clear audit trail of session events

**User Experience Balance:**

- 30-minute timeout provides good security/usability balance
- Warning system prevents frustrating logouts
- Activity detection should be comprehensive but not intrusive

**Technical Challenges:**

- Background processing limitations on mobile
- App state transitions (kill, background, foreground)
- Secure storage reliability across app restarts
- Timing precision for session management
