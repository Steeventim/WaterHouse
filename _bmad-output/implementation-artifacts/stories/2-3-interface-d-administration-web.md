---
story_id: "2.3"
story_key: "2-3-interface-d-administration-web"
epic: "Epic 2: Gestion des Données de Base"
title: "Interface d'administration web"
status: "ready-for-dev"
assignee: ""
created: "2026-01-27"
updated: "2026-01-27"
---

# Story 2.3: Interface d'administration web

## User Story

**As a** gestionnaire (building manager),
**I want to** administer buildings and apartments through a web interface,
**So that** I can manage the property data centrally.

## Acceptance Criteria

**Given** I am logged in as admin
**When** I access the web interface
**Then** I can view, create, update, and delete building and apartment data
**And** Changes are synchronized to mobile applications

## Technical Requirements

### Functional Requirements
- **REQ-WEB-001**: Interface d'administration des immeubles et logements
- **REQ-WEB-002**: Gestion des compteurs (numéro, localisation, index initial)

### Non-Functional Requirements
- **REQ-COMP-002**: Navigateurs web modernes (Chrome, Firefox, Safari)
- **REQ-USAB-002**: Support des langues française et anglaise

## Technical Design

### Architecture Context

**Bounded Context**: Configuration + Catalog
**Frontend**: React web application
**Backend**: NestJS API with existing modules

### Web Application Structure

#### Tech Stack
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **Forms**: React Hook Form + Yup validation
- **Styling**: MUI theme system

#### Project Structure
```
apps/web/
├── src/
│   ├── components/
│   │   ├── common/          # Shared components
│   │   ├── layout/          # Layout components
│   │   └── forms/           # Form components
│   ├── features/
│   │   ├── auth/            # Authentication
│   │   ├── buildings/       # Building management
│   │   ├── apartments/      # Apartment management
│   │   └── meters/          # Meter management
│   ├── services/
│   │   ├── api/             # API client
│   │   └── storage/         # Local storage
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Utilities
│   └── types/               # TypeScript types
```

### API Integration

#### RTK Query API Client
```typescript
// services/api/buildingsApi.ts
export const buildingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBuildings: builder.query<Building[], void>({
      query: () => '/buildings',
      providesTags: ['Buildings'],
    }),
    getBuilding: builder.query<Building, string>({
      query: (id) => `/buildings/${id}`,
      providesTags: (result, error, id) => [{ type: 'Buildings', id }],
    }),
    createBuilding: builder.mutation<Building, CreateBuildingRequest>({
      query: (building) => ({
        url: '/buildings',
        method: 'POST',
        body: building,
      }),
      invalidatesTags: ['Buildings'],
    }),
    updateBuilding: builder.mutation<Building, UpdateBuildingRequest>({
      query: ({ id, ...building }) => ({
        url: `/buildings/${id}`,
        method: 'PUT',
        body: building,
      }),
      invalidatesTags: (result, error, arg) => [
        'Buildings',
        { type: 'Buildings', id: arg.id },
      ],
    }),
    deleteBuilding: builder.mutation<void, string>({
      query: (id) => ({
        url: `/buildings/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Buildings'],
    }),
  }),
});
```

### UI Components

#### Building Management Page
```typescript
// features/buildings/BuildingsPage.tsx
import React from 'react';
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useGetBuildingsQuery } from '../../services/api/buildingsApi';
import { Building } from '../../types';

export const BuildingsPage: React.FC = () => {
  const { data: buildings, isLoading } = useGetBuildingsQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Gestion des Immeubles
      </Typography>

      <Button
        variant="contained"
        startIcon={<Add />}
        sx={{ mb: 2 }}
      >
        Ajouter un immeuble
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Adresse</TableCell>
              <TableCell>Étages</TableCell>
              <TableCell>Appartements</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {buildings?.map((building) => (
              <TableRow key={building.id}>
                <TableCell>{building.name}</TableCell>
                <TableCell>{building.address}</TableCell>
                <TableCell>{building.totalFloors}</TableCell>
                <TableCell>{building.totalApartments}</TableCell>
                <TableCell>
                  <IconButton>
                    <Edit />
                  </IconButton>
                  <IconButton>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};
```

#### Building Form Component
```typescript
// components/forms/BuildingForm.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';

const schema = yup.object({
  name: yup.string().required('Le nom est requis'),
  address: yup.string().required('L\'adresse est requise'),
  totalFloors: yup.number().min(1, 'Au moins 1 étage').required(),
  totalApartments: yup.number().min(1, 'Au moins 1 appartement').required(),
});

interface BuildingFormData {
  name: string;
  address: string;
  totalFloors: number;
  totalApartments: number;
}

interface BuildingFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: BuildingFormData) => void;
  initialData?: Partial<BuildingFormData>;
}

export const BuildingForm: React.FC<BuildingFormProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<BuildingFormData>({
    resolver: yupResolver(schema),
    defaultValues: initialData,
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Modifier l\'immeuble' : 'Ajouter un immeuble'}
      </DialogTitle>
      <DialogContent>
        <TextField
          {...register('name')}
          label="Nom de l'immeuble"
          fullWidth
          margin="normal"
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        <TextField
          {...register('address')}
          label="Adresse"
          fullWidth
          margin="normal"
          error={!!errors.address}
          helperText={errors.address?.message}
        />
        <TextField
          {...register('totalFloors')}
          label="Nombre d'étages"
          type="number"
          fullWidth
          margin="normal"
          error={!!errors.totalFloors}
          helperText={errors.totalFloors?.message}
        />
        <TextField
          {...register('totalApartments')}
          label="Nombre d'appartements"
          type="number"
          fullWidth
          margin="normal"
          error={!!errors.totalApartments}
          helperText={errors.totalApartments?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleSubmit(onSubmit)} variant="contained">
          {initialData ? 'Modifier' : 'Ajouter'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### Authentication Integration

#### Protected Routes
```typescript
// components/auth/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

### Data Synchronization

#### Real-time Updates
```typescript
// services/sync/webSyncService.ts
export class WebSyncService {
  private ws: WebSocket | null = null;

  connect(): void {
    this.ws = new WebSocket('ws://localhost:3001');

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'BUILDING_UPDATED') {
        // Invalidate RTK Query cache
        // Dispatch action to update local state
      }
    };
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
    }
  }
}
```

### Testing Strategy

#### Unit Tests
- Form validation and submission
- Component rendering and interactions
- API integration with mocked responses
- Authentication and authorization logic

#### Integration Tests
- Complete CRUD workflows
- Form submission to API
- State management across components
- Error handling and user feedback

#### E2E Tests
- Full user journeys (login → CRUD operations)
- Cross-browser compatibility
- Responsive design testing
- Accessibility compliance

### Implementation Checklist

#### Frontend Setup
- [ ] React application with TypeScript
- [ ] Material-UI theme and components
- [ ] Redux Toolkit + RTK Query setup
- [ ] React Router configuration
- [ ] Form validation with Yup

#### Authentication
- [ ] Login/logout functionality
- [ ] Protected routes
- [ ] Role-based access control
- [ ] Session management

#### Building Management
- [ ] Buildings list page
- [ ] Building creation form
- [ ] Building edit functionality
- [ ] Building deletion with confirmation

#### Apartment Management
- [ ] Apartments list by building
- [ ] Apartment CRUD operations
- [ ] Bulk operations support

#### Meter Management
- [ ] Meter assignment to apartments
- [ ] Meter configuration
- [ ] Initial readings setup

#### UI/UX
- [ ] Responsive design for tablets
- [ ] French language support
- [ ] Loading states and error handling
- [ ] Confirmation dialogs

### Success Criteria

#### Functional Success
- Complete CRUD operations for buildings, apartments, meters
- Form validation and error handling
- Data persistence and synchronization
- Role-based access control working

#### Technical Success
- Fast loading times (< 2 seconds)
- Responsive design works on all screen sizes
- API integration reliable and efficient
- State management handles complex interactions

#### Quality Success
- Code coverage > 80% for web application
- Accessibility standards met (WCAG 2.1)
- Cross-browser compatibility verified
- User experience validated with stakeholders

### Definition of Done

- [ ] Web application structure created
- [ ] Authentication system implemented
- [ ] Building management CRUD complete
- [ ] Apartment management CRUD complete
- [ ] Meter management implemented
- [ ] Responsive design implemented
- [ ] French localization complete
- [ ] Unit and integration tests passing
- [ ] E2E tests passing
- [ ] Code reviewed and approved

### Notes for Developer

**Web-First Experience:**
- This is the primary interface for property managers
- Must be intuitive and efficient for daily use
- Consider bulk operations for large portfolios
- Plan for future features (reports, analytics)

**Integration Critical:**
- Changes must sync to mobile applications
- Real-time updates enhance user experience
- API must handle web-specific requirements
- Consider offline capabilities for web app

**Scalability Planning:**
- Design for hundreds of buildings/apartments
- Efficient data loading and pagination
- Consider future multi-tenancy features
- Plan for role-based feature access