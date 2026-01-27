---
story_id: "1.2"
story_key: "1-2-acces-rapide-par-pin-biometrie"
epic: "Epic 1: Authentification et Accès Sécurisé"
title: "Accès rapide par PIN/Biometrie"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 1.2: Accès rapide par PIN/Biometrie

## User Story

**As a** releveur (meter reader),
**I want to** use PIN or biometric authentication for quick access,
**So that** I don't need to enter OTP every time I open the app.

## Acceptance Criteria

**Given** I am authenticated with OTP
**When** I enable PIN or biometric authentication
**Then** I can login using PIN/biometric instead of OTP
**And** Authentication fails if PIN/biometric is incorrect

## Technical Requirements

### Functional Requirements

- **REQ-AUTH-002**: Support du code PIN ou biométrie pour accès rapide
- **REQ-SEC-002**: Authentification à deux facteurs obligatoire

### Non-Functional Requirements

- **REQ-PERF-001**: Temps de démarrage application < 3 secondes
- **REQ-SEC-001**: Chiffrement AES-256 des données sensibles
- **REQ-USAB-001**: Interface adaptée aux écrans 5-6 pouces

## Technical Design

### Architecture Context

**Bounded Context**: Auth
**Module**: apps/api/src/modules/auth/
**Mobile Feature**: apps/mobile/src/features/auth/

### API Endpoints

#### POST /api/v1/auth/setup-quick-access

**Purpose**: Setup PIN or biometric authentication
**Request Body**:

```json
{
  "accessType": "pin" | "biometric",
  "pin": "1234" // only for pin type
}
```

**Response**:

```json
{
  "success": true,
  "message": "Quick access configured successfully",
  "accessType": "pin"
}
```

#### POST /api/v1/auth/quick-login

**Purpose**: Authenticate using PIN or biometric
**Request Body**:

```json
{
  "accessType": "pin" | "biometric",
  "pin": "1234" // only for pin type
}
```

**Response**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "phoneNumber": "+2250102030405",
    "role": "collector",
    "name": "Jean Dupont"
  },
  "expiresIn": 3600
}
```

### Database Schema Updates

#### users table (extension)

```sql
ALTER TABLE users ADD COLUMN quick_access_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN quick_access_type VARCHAR(20); -- 'pin' or 'biometric'
ALTER TABLE users ADD COLUMN pin_hash VARCHAR(255); -- bcrypt hash for PIN
ALTER TABLE users ADD COLUMN biometric_key VARCHAR(255); -- encrypted biometric data
ALTER TABLE users ADD COLUMN last_pin_change TIMESTAMP;
ALTER TABLE users ADD COLUMN pin_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN pin_locked_until TIMESTAMP;
```

### Mobile Implementation

#### React Native Biometric/PIN Setup

```typescript
// features/auth/QuickAccessSetup.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useBiometricAuth } from '../hooks/useBiometricAuth';

interface QuickAccessSetupProps {
  onSetupComplete: (type: 'pin' | 'biometric') => void;
}

export const QuickAccessSetup: React.FC<QuickAccessSetupProps> = ({ onSetupComplete }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const { isBiometricAvailable, authenticateBiometric } = useBiometricAuth();

  const handlePinSetup = async () => {
    if (pin !== confirmPin) {
      // Show error
      return;
    }
    // API call to setup PIN
    onSetupComplete('pin');
  };

  const handleBiometricSetup = async () => {
    const success = await authenticateBiometric();
    if (success) {
      // API call to setup biometric
      onSetupComplete('biometric');
    }
  };

  return (
    <View>
      <Text>Configurez l'accès rapide</Text>

      {/* PIN Setup */}
      <TextInput
        placeholder="Entrez un code PIN (4 chiffres)"
        value={pin}
        onChangeText={setPin}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry
      />
      <TextInput
        placeholder="Confirmez le code PIN"
        value={confirmPin}
        onChangeText={setConfirmPin}
        keyboardType="numeric"
        maxLength={4}
        secureTextEntry
      />
      <TouchableOpacity onPress={handlePinSetup}>
        <Text>Configurer PIN</Text>
      </TouchableOpacity>

      {/* Biometric Setup */}
      {isBiometricAvailable && (
        <TouchableOpacity onPress={handleBiometricSetup}>
          <Text>Configurer Biométrie</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
```

#### Redux State Extensions

```typescript
// features/auth/authSlice.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpRequestId: string | null;
  quickAccess: {
    enabled: boolean;
    type: "pin" | "biometric" | null;
    isLocked: boolean;
    attempts: number;
  };
}

interface User {
  id: string;
  phoneNumber: string;
  role: "collector" | "manager" | "admin";
  name: string;
  quickAccessEnabled?: boolean;
  quickAccessType?: "pin" | "biometric";
}
```

#### RTK Query Extensions

```typescript
// services/authApi.ts
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    setupQuickAccess: builder.mutation<
      { success: boolean; accessType: string },
      { accessType: "pin" | "biometric"; pin?: string }
    >({
      query: (body) => ({
        url: "/auth/setup-quick-access",
        method: "POST",
        body,
      }),
    }),
    quickLogin: builder.mutation<
      AuthResponse,
      { accessType: "pin" | "biometric"; pin?: string }
    >({
      query: (body) => ({
        url: "/auth/quick-login",
        method: "POST",
        body,
      }),
    }),
  }),
});
```

### Security Considerations

#### PIN Security

- 4-digit numeric PIN (minimum)
- bcrypt hashing with salt
- Maximum 5 incorrect attempts before lockout (15 minutes)
- Lockout period increases with repeated failures
- PIN change requires OTP verification

#### Biometric Security

- Device-level biometric authentication (fingerprint/face)
- Fallback to PIN if biometric fails
- Biometric data never stored on server (only success/failure result)
- Graceful degradation on devices without biometric support

#### Session Management

- Quick access tokens have same expiration as OTP tokens
- Automatic fallback to OTP after extended periods
- Clear separation between quick access and full authentication

### React Native Biometric Integration

#### Biometric Hook

```typescript
// hooks/useBiometricAuth.ts
import { useState, useEffect } from "react";
import { Platform } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<
    "fingerprint" | "facial" | "iris" | null
  >(null);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();

      setIsAvailable(compatible && enrolled);
      if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("fingerprint");
      } else if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        setBiometricType("facial");
      }
    } catch (error) {
      console.error("Biometric check failed:", error);
    }
  };

  const authenticate = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Utilisez votre biométrie pour vous connecter",
        fallbackLabel: "Utiliser le code PIN",
        cancelLabel: "Annuler",
        disableDeviceFallback: false,
      });

      return result.success;
    } catch (error) {
      console.error("Biometric authentication failed:", error);
      return false;
    }
  };

  return {
    isAvailable,
    biometricType,
    authenticate,
  };
};
```

### Error Handling

#### PIN Errors

```json
// Invalid PIN
{
  "error": {
    "code": "INVALID_PIN",
    "message": "Code PIN incorrect",
    "remainingAttempts": 4
  }
}

// PIN Locked
{
  "error": {
    "code": "PIN_LOCKED",
    "message": "Code PIN verrouillé. Réessayez dans 15 minutes",
    "unlockTime": "2026-01-27T10:30:00Z"
  }
}
```

#### Biometric Errors

```json
// Biometric Failed
{
  "error": {
    "code": "BIOMETRIC_FAILED",
    "message": "Authentification biométrique échouée. Utilisez le code PIN."
  }
}

// Biometric Not Available
{
  "error": {
    "code": "BIOMETRIC_UNAVAILABLE",
    "message": "Biométrie non disponible sur cet appareil"
  }
}
```

### Testing Strategy

#### Unit Tests

- PIN validation and hashing logic
- Biometric availability detection
- Lockout mechanism and timing
- Authentication state management

#### Integration Tests

- Complete PIN setup and login flow
- Biometric setup and authentication
- Lockout and recovery scenarios
- API error handling

#### E2E Tests

- PIN setup from authenticated state
- Biometric authentication on supported devices
- Fallback to PIN when biometric fails
- Lockout recovery after timeout

### Implementation Checklist

#### Backend Implementation

- [ ] Extend User entity with quick access fields
- [ ] PIN hashing service with bcrypt
- [ ] Biometric setup endpoint
- [ ] Quick login endpoint with PIN/biometric validation
- [ ] Lockout mechanism and attempt tracking
- [ ] Security audit for PIN storage

#### Mobile Implementation

- [ ] Biometric availability detection
- [ ] PIN setup screen with validation
- [ ] Biometric setup flow
- [ ] Quick access login screen
- [ ] Redux state management for quick access
- [ ] Secure storage for PIN/biometric preferences

#### Security Testing

- [ ] PIN brute force protection
- [ ] Biometric bypass prevention
- [ ] Secure storage validation
- [ ] Session management security

### Dependencies

#### Backend Dependencies

- bcrypt (already included)
- @nestjs/jwt (already included)

#### Mobile Dependencies

- expo-local-authentication (for biometric)
- @react-native-async-storage/async-storage (already included)
- react-native-keychain (for secure PIN storage)

### Success Criteria

#### Functional Success

- User can setup PIN after OTP authentication
- User can setup biometric authentication
- Quick login works with PIN or biometric
- Invalid credentials are properly rejected
- Lockout mechanism works after failed attempts

#### Technical Success

- PINs are securely hashed and stored
- Biometric authentication uses device security
- Fallback mechanisms work properly
- Authentication response time < 1 second

#### Quality Success

- Code coverage > 90% for quick access features
- Security testing passed
- All error scenarios handled gracefully
- User experience is smooth and intuitive

### Definition of Done

- [ ] PIN setup and authentication working
- [ ] Biometric setup and authentication working
- [ ] Lockout mechanism implemented and tested
- [ ] Fallback to OTP when quick access fails
- [ ] Security audit completed
- [ ] Code reviewed and approved
- [ ] Unit and integration tests passing
- [ ] E2E tests passing on Android devices
- [ ] Documentation updated

### Notes for Developer

**Security First:**

- Never store biometric data on server
- PIN must be hashed with strong algorithm
- Implement proper lockout to prevent brute force
- Clear security boundaries between OTP and quick access

**User Experience:**

- Make setup process intuitive and guided
- Provide clear feedback for all error states
- Allow users to disable quick access if needed
- Support both PIN and biometric seamlessly

**Device Compatibility:**

- Gracefully handle devices without biometric support
- Test on various Android versions (8.0+)
- Consider device performance for biometric operations
