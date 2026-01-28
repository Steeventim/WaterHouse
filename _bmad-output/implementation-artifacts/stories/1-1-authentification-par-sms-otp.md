---
story_id: '1.1'
story_key: '1-1-authentification-par-sms-otp'
epic: 'Epic 1: Authentification et Accès Sécurisé'
title: 'Authentification par SMS OTP'
status: 'in-progress'
assignee: ''
created: '2026-01-27'
updated: '2026-01-27'
---

# Story 1.1: Authentification par SMS OTP

## User Story

**As a** releveur (meter reader),
**I want to** authenticate with my phone number and receive an OTP SMS,
**So that** I can securely access the mobile application.

## Acceptance Criteria

**Given** I have a valid phone number
**When** I enter my phone number and request authentication
**Then** I receive an OTP SMS and can enter it to login
**And** Invalid OTP is rejected with clear error message

## Technical Requirements

### Functional Requirements

- **REQ-AUTH-001**: Authentification par numéro de téléphone + OTP SMS
- **REQ-SEC-002**: Authentification à deux facteurs obligatoire

### Non-Functional Requirements

- **REQ-PERF-001**: Temps de démarrage application < 3 secondes
- **REQ-SEC-001**: Chiffrement AES-256 des données sensibles
- **REQ-SEC-003**: Accès basé sur les rôles (releveur, gestionnaire)

## Technical Design

### Architecture Context

**Bounded Context**: Auth
**Module**: apps/api/src/modules/auth/
**Mobile Feature**: apps/mobile/src/features/auth/

### API Endpoints

#### POST /api/v1/auth/send-otp

**Purpose**: Send OTP SMS to phone number
**Request Body**:

```json
{
  "phoneNumber": "+2250102030405"
}
```

**Response**:

```json
{
  "success": true,
  "message": "OTP sent successfully",
  "requestId": "req_123456789"
}
```

#### POST /api/v1/auth/verify-otp

**Purpose**: Verify OTP and return JWT tokens
**Request Body**:

```json
{
  "phoneNumber": "+2250102030405",
  "otp": "123456",
  "requestId": "req_123456789"
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

### Database Schema

#### users table

```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'collector',
  name VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_active ON users(is_active);
```

#### otp_requests table

```sql
CREATE TABLE otp_requests (
  id VARCHAR(50) PRIMARY KEY,
  phone_number VARCHAR(20) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  request_id VARCHAR(50) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT chk_attempts CHECK (attempts <= 3)
);

-- Indexes
CREATE INDEX idx_otp_requests_phone ON otp_requests(phone_number);
CREATE INDEX idx_otp_requests_request_id ON otp_requests(request_id);
CREATE INDEX idx_otp_requests_expires ON otp_requests(expires_at);
```

### Africa's Talking Integration

**Service**: Africa's Talking SMS API
**Configuration**:

```typescript
// config/africas-talking.config.ts
export const africasTalkingConfig = {
  apiKey: process.env.AFRICAS_TALKING_API_KEY,
  username: process.env.AFRICAS_TALKING_USERNAME,
  senderId: process.env.AFRICAS_TALKING_SENDER_ID || 'WATERHOUSE',
};
```

**SMS Template**:

```
Votre code de vérification WaterHouse est: {otp}
Ce code expire dans 5 minutes.
```

### JWT Configuration

**Access Token**: 1 hour expiration
**Refresh Token**: 30 days expiration
**Algorithm**: HS256
**Payload**:

```json
{
  "sub": "user_123",
  "phoneNumber": "+2250102030405",
  "role": "collector",
  "iat": 1640995200,
  "exp": 1640998800
}
```

### Mobile Implementation

#### Redux State Structure

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
}

interface User {
  id: string;
  phoneNumber: string;
  role: 'collector' | 'manager' | 'admin';
  name: string;
}
```

#### RTK Query API

```typescript
// services/authApi.ts
export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendOtp: builder.mutation<
      { success: boolean; requestId: string },
      { phoneNumber: string }
    >({
      query: (body) => ({
        url: '/auth/send-otp',
        method: 'POST',
        body,
      }),
    }),
    verifyOtp: builder.mutation<
      AuthResponse,
      { phoneNumber: string; otp: string; requestId: string }
    >({
      query: (body) => ({
        url: '/auth/verify-otp',
        method: 'POST',
        body,
      }),
    }),
  }),
});
```

### Security Considerations

#### OTP Security

- 6-digit numeric code
- 5-minute expiration
- Maximum 3 verification attempts per request
- One-time use only
- Rate limiting: max 5 requests per phone number per hour

#### Data Protection

- Phone numbers stored as-is (no hashing for authentication)
- OTP codes hashed with bcrypt before storage
- JWT tokens signed with strong secret
- HTTPS required for all API calls

### Error Handling

#### API Error Responses

```json
// Invalid OTP
{
  "error": {
    "code": "INVALID_OTP",
    "message": "Code OTP invalide"
  }
}

// OTP Expired
{
  "error": {
    "code": "OTP_EXPIRED",
    "message": "Code OTP expiré, veuillez en demander un nouveau"
  }
}

// Too Many Attempts
{
  "error": {
    "code": "TOO_MANY_ATTEMPTS",
    "message": "Trop de tentatives, veuillez demander un nouveau code"
  }
}
```

### Testing Strategy

#### Unit Tests

- OTP generation and validation logic
- JWT token creation and verification
- Africa's Talking service mocking

#### Integration Tests

- Complete OTP flow (send → verify → login)
- Database operations
- API error responses

#### E2E Tests

- Mobile app authentication flow
- SMS delivery verification (mocked)
- Token refresh mechanism

### Implementation Checklist

#### Backend Implementation

- [ ] NestJS Auth module structure
- [ ] TypeORM entities (User, OtpRequest)
- [ ] Africa's Talking service integration
- [ ] JWT service with access/refresh tokens
- [ ] OTP generation and validation logic
- [ ] Rate limiting middleware
- [ ] Input validation DTOs
- [ ] Error handling and logging

#### Mobile Implementation

- [ ] React Native auth screens (phone input, OTP input)
- [ ] Redux auth slice and actions
- [ ] RTK Query API integration
- [ ] Token storage (secure storage)
- [ ] Auto-login on app start
- [ ] Error handling and user feedback

#### Database Migration

- [ ] Users table creation
- [ ] OTP requests table creation
- [ ] Indexes for performance
- [ ] Seed data for testing

#### Testing

- [ ] Unit tests for all services
- [ ] Integration tests for API endpoints
- [ ] E2E tests for mobile flow
- [ ] Security testing (OTP brute force protection)

### Dependencies

#### Backend Dependencies

- @nestjs/jwt
- @nestjs/typeorm
- typeorm
- bcrypt
- africas-talking (npm package)
- class-validator
- class-transformer

#### Mobile Dependencies

- @reduxjs/toolkit
- react-redux
- @react-native-async-storage/async-storage
- @react-navigation/native
- react-native-paper

### Success Criteria

#### Functional Success

- User can enter phone number and receive OTP SMS
- User can enter OTP and successfully authenticate
- Invalid OTP shows clear error message
- JWT tokens are properly generated and stored

#### Technical Success

- OTP delivery rate > 95% (Africa's Talking reliability)
- Authentication response time < 2 seconds
- Secure token storage on mobile device
- Proper error handling for all edge cases

#### Quality Success

- Code coverage > 90% for auth module
- All acceptance criteria tested and passing
- Security audit passed (OTP protection, token security)
- Performance benchmarks met

### Risk Mitigation

#### Technical Risks

- **Africa's Talking API downtime**: Implement retry mechanism with exponential backoff
- **SMS delivery failures**: Add email fallback for critical communications
- **Token theft**: Implement token refresh rotation and short-lived access tokens

#### Business Risks

- **User experience**: Ensure SMS delivery is fast and reliable
- **Security concerns**: Implement proper OTP expiration and attempt limits
- **International numbers**: Validate phone number format for Ivory Coast (+225)

### Definition of Done

- [ ] All acceptance criteria implemented and tested
- [ ] Code reviewed and approved
- [ ] Unit tests written and passing (>90% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing on Android device
- [ ] Security testing completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Demo to product owner successful

### Notes for Developer

**First Story Considerations:**

- This is the foundation for all other features - get authentication right
- Focus on security and reliability over fancy UI
- Test thoroughly with real SMS (development credits from Africa's Talking)
- Consider offline scenarios (OTP validity during offline periods)

**Integration Points:**

- JWT tokens will be used by all subsequent API calls
- User roles will control feature access throughout the app
- Phone number becomes the primary user identifier

**Testing Tips:**

- Use Africa's Talking sandbox for development testing
- Mock SMS service for unit tests
- Test with various phone number formats
- Verify token expiration and refresh flow
