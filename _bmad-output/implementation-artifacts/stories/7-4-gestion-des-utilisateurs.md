# Story 7-4: Gestion des Utilisateurs

## Story Header
- **Story ID**: 7-4
- **Key**: WH-7-4
- **Epic**: Epic 7 - Interface Web de Gestion
- **Title**: Gestion des Utilisateurs
- **Status**: Ready for Dev
- **Assignee**: TBD
- **Created Date**: 2026-01-26
- **Updated Date**: 2026-01-26
- **Story Points**: 8

## User Story
En tant que **gestionnaire d'immeuble**, je veux **gérer les utilisateurs de mes immeubles** afin que **je puisse contrôler qui a accès aux données et fonctionnalités**.

En tant que **gestionnaire d'immeuble**, je veux **assigner des rôles aux utilisateurs** afin que **je puisse définir leurs permissions d'accès**.

## Acceptance Criteria
### Fonctionnel
- [ ] Liste des utilisateurs par immeuble
- [ ] Ajout/modification/suppression d'utilisateurs
- [ ] Gestion des rôles (releveur, gestionnaire, locataire)
- [ ] Réinitialisation des mots de passe
- [ ] Import en masse depuis CSV
- [ ] Audit trail des changements
- [ ] Notifications des changements de rôle

### Non-Fonctionnel
- [ ] Interface sécurisée (authentification requise)
- [ ] Validation des données d'entrée
- [ ] Performance avec centaines d'utilisateurs
- [ ] Conformité RGPD (droit à l'oubli)

## Technical Requirements

### Architecture Context
- **Bounded Context**: User Management & Administration
- **Integration Points**: Auth Service, Building Service
- **Security**: Hashing mots de passe, audit logging
- **Performance**: Pagination, recherche optimisée

### API Endpoints

#### Backend (NestJS)
```typescript
// Liste utilisateurs
GET /api/admin/users
Authorization: Bearer {manager-token}
Query: ?buildingId={id}&role={role}&search={name}&page={number}&limit={number}

// Détails utilisateur
GET /api/admin/users/{id}
Authorization: Bearer {manager-token}

// Création utilisateur
POST /api/admin/users
Authorization: Bearer {manager-token}
Content-Type: application/json

{
  "email": "user@example.com",
  "phone": "+22501020304",
  "firstName": "John",
  "lastName": "Doe",
  "role": "reader|manager|tenant",
  "buildingId": "uuid",
  "apartmentNumber": "A101"
}

// Modification utilisateur
PUT /api/admin/users/{id}
Authorization: Bearer {manager-token}

// Suppression utilisateur
DELETE /api/admin/users/{id}
Authorization: Bearer {manager-token}

// Réinitialisation mot de passe
POST /api/admin/users/{id}/reset-password
Authorization: Bearer {manager-token}

// Import CSV
POST /api/admin/users/import
Authorization: Bearer {manager-token}
Content-Type: multipart/form-data

// Export utilisateurs
GET /api/admin/users/export
Authorization: Bearer {manager-token}
Query: ?buildingId={id}&format={csv|json}
```

### Database Schema

#### Extension de users
```sql
-- Ajout de colonnes pour gestion
ALTER TABLE users ADD COLUMN building_id UUID REFERENCES buildings(id);
ALTER TABLE users ADD COLUMN apartment_number VARCHAR(20);
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'tenant' CHECK (role IN ('reader', 'manager', 'tenant', 'admin'));
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT true;
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
ALTER TABLE users ADD COLUMN password_reset_token VARCHAR(100);
ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;
ALTER TABLE users ADD COLUMN created_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN updated_by UUID REFERENCES users(id);
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP; -- Soft delete
```

#### Table: user_audit_log
```sql
CREATE TABLE user_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- create, update, delete, login, password_reset
  old_values JSONB,
  new_values JSONB,
  performed_by UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_audit_user ON user_audit_log(user_id);
CREATE INDEX idx_audit_action ON user_audit_log(action);
CREATE INDEX idx_audit_performed_by ON user_audit_log(performed_by);
CREATE INDEX idx_audit_created_at ON user_audit_log(created_at);
```

### Web Implementation (React)

#### Composant Liste Utilisateurs
```typescript
// src/components/admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Card, Text, Button, Searchbar, Chip, Menu, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { api } from '../../services/api';

interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  role: 'reader' | 'manager' | 'tenant' | 'admin';
  buildingName: string;
  apartmentNumber: string;
  isActive: boolean;
  lastLogin: string;
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [buildings, setBuildings] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadBuildings();
    loadUsers();
  }, [searchQuery, selectedBuilding]);

  const loadBuildings = async () => {
    try {
      const response = await api.get('/buildings/managed');
      setBuildings(response.data);
    } catch (error) {
      console.error('Failed to load buildings:', error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        buildingId: selectedBuilding || undefined
      };
      const response = await api.get('/admin/users', { params });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'red';
      case 'manager': return 'orange';
      case 'reader': return 'blue';
      case 'tenant': return 'green';
      default: return 'gray';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'manager': return 'Gestionnaire';
      case 'reader': return 'Releveur';
      case 'tenant': return 'Locataire';
      default: return role;
    }
  };

  const resetPassword = async (userId: string, userName: string) => {
    Alert.alert(
      'Réinitialisation mot de passe',
      `Voulez-vous réinitialiser le mot de passe de ${userName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await api.post(`/admin/users/${userId}/reset-password`);
              Alert.alert('Succès', 'Email de réinitialisation envoyé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de réinitialiser le mot de passe');
            }
          }
        }
      ]
    );
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'désactiver' : 'activer';
    Alert.alert(
      `Confirmation`,
      `Voulez-vous ${action} cet utilisateur ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              await api.put(`/admin/users/${userId}`, {
                isActive: !currentStatus
              });
              loadUsers(); // Recharger la liste
            } catch (error) {
              Alert.alert('Erreur', `Impossible de ${action} l'utilisateur`);
            }
          }
        }
      ]
    );
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <Card style={styles.userCard} onPress={() => navigateToUserDetail(item)}>
      <Card.Content>
        <View style={styles.userHeader}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.firstName} {item.lastName}
            </Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <Text style={styles.userPhone}>{item.phone}</Text>
          </View>
          
          <View style={styles.userMeta}>
            <Chip 
              mode="outlined" 
              textStyle={{ color: getRoleColor(item.role) }}
              style={{ marginBottom: 4 }}
            >
              {getRoleText(item.role)}
            </Chip>
            
            <Chip 
              mode="outlined" 
              textStyle={{ color: item.isActive ? 'green' : 'red' }}
            >
              {item.isActive ? 'Actif' : 'Inactif'}
            </Chip>
          </View>
        </View>

        <View style={styles.userDetails}>
          <Text style={styles.buildingInfo}>
            {item.buildingName} - Appartement {item.apartmentNumber}
          </Text>
          
          {item.lastLogin && (
            <Text style={styles.lastLogin}>
              Dernière connexion: {new Date(item.lastLogin).toLocaleDateString('fr-FR')}
            </Text>
          )}
        </View>

        <View style={styles.userActions}>
          <Button
            mode="outlined"
            onPress={() => resetPassword(item.id, `${item.firstName} ${item.lastName}`)}
            style={styles.actionButton}
          >
            Reset MDP
          </Button>
          
          <Button
            mode={item.isActive ? "outlined" : "contained"}
            onPress={() => toggleUserStatus(item.id, item.isActive)}
            style={styles.actionButton}
            textColor={item.isActive ? 'red' : 'white'}
          >
            {item.isActive ? 'Désactiver' : 'Activer'}
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  const navigateToUserDetail = (user: User) => {
    navigation.navigate('UserDetail', { userId: user.id });
  };

  const navigateToCreateUser = () => {
    navigation.navigate('CreateUser');
  };

  return (
    <View style={styles.container}>
      <View style={styles.filters}>
        <Searchbar
          placeholder="Rechercher par nom ou email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchBar}
        />
        
        <Menu
          visible={false}
          onDismiss={() => {}}
          anchor={<Text>Immeuble: {selectedBuilding ? buildings.find(b => b.id === selectedBuilding)?.name : 'Tous'}</Text>}
        >
          {/* Menu items pour filtrer par immeuble */}
        </Menu>
      </View>

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderUserItem}
        refreshing={loading}
        onRefresh={loadUsers}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun utilisateur trouvé</Text>
          </View>
        }
      />

      <FAB
        icon="plus"
        onPress={navigateToCreateUser}
        style={styles.fab}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  filters: { padding: 16 },
  searchBar: { marginBottom: 8 },
  userCard: { 
    marginHorizontal: 16, 
    marginVertical: 4,
    elevation: 2
  },
  userHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 12
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  userEmail: { fontSize: 14, color: 'gray' },
  userPhone: { fontSize: 14, color: 'gray' },
  userMeta: { alignItems: 'flex-end' },
  userDetails: { marginBottom: 12 },
  buildingInfo: { fontSize: 14 },
  lastLogin: { fontSize: 12, color: 'gray', marginTop: 4 },
  userActions: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  actionButton: { flex: 1, marginHorizontal: 4 },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 32
  },
  emptyText: { fontSize: 16, color: 'gray', textAlign: 'center' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 }
});
```

#### Composant Création/Édition Utilisateur
```typescript
// src/components/admin/UserForm.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, RadioButton, Picker } from 'react-native-paper';
import { RouteProp } from '@react-navigation/native';
import { api } from '../../services/api';

type UserFormRouteProp = RouteProp<
  { UserForm: { userId?: string; mode: 'create' | 'edit' } }, 
  'UserForm'
>;

interface Props {
  route: UserFormRouteProp;
}

export const UserForm: React.FC<Props> = ({ route }) => {
  const { userId, mode } = route.params;
  const [loading, setLoading] = useState(false);
  const [buildings, setBuildings] = useState([]);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    role: 'tenant',
    buildingId: '',
    apartmentNumber: ''
  });

  useEffect(() => {
    loadBuildings();
    if (mode === 'edit' && userId) {
      loadUserData();
    }
  }, [userId, mode]);

  const loadBuildings = async () => {
    try {
      const response = await api.get('/buildings/managed');
      setBuildings(response.data);
    } catch (error) {
      console.error('Failed to load buildings:', error);
    }
  };

  const loadUserData = async () => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      setFormData({
        email: response.data.email,
        phone: response.data.phone,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        role: response.data.role,
        buildingId: response.data.buildingId,
        apartmentNumber: response.data.apartmentNumber
      });
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.firstName || !formData.lastName) {
      alert('Veuillez remplir tous les champs obligatoires');
      return false;
    }
    
    if (!formData.buildingId) {
      alert('Veuillez sélectionner un immeuble');
      return false;
    }

    return true;
  };

  const saveUser = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (mode === 'create') {
        await api.post('/admin/users', formData);
        alert('Utilisateur créé avec succès');
      } else {
        await api.put(`/admin/users/${userId}`, formData);
        alert('Utilisateur modifié avec succès');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Failed to save user:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { label: 'Locataire', value: 'tenant' },
    { label: 'Releveur', value: 'reader' },
    { label: 'Gestionnaire', value: 'manager' },
    { label: 'Admin', value: 'admin' }
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.formCard}>
        <Card.Title 
          title={mode === 'create' ? 'Créer un utilisateur' : 'Modifier l\'utilisateur'} 
        />
        <Card.Content>
          <TextInput
            label="Prénom *"
            value={formData.firstName}
            onChangeText={(text) => setFormData({...formData, firstName: text})}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Nom *"
            value={formData.lastName}
            onChangeText={(text) => setFormData({...formData, lastName: text})}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Email *"
            value={formData.email}
            onChangeText={(text) => setFormData({...formData, email: text})}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            mode="outlined"
          />

          <TextInput
            label="Téléphone"
            value={formData.phone}
            onChangeText={(text) => setFormData({...formData, phone: text})}
            style={styles.input}
            keyboardType="phone-pad"
            mode="outlined"
          />

          <Text style={styles.sectionTitle}>Rôle</Text>
          <RadioButton.Group 
            onValueChange={(value) => setFormData({...formData, role: value})}
            value={formData.role}
          >
            {roles.map((role) => (
              <View key={role.value} style={styles.radioOption}>
                <RadioButton value={role.value} />
                <Text>{role.label}</Text>
              </View>
            ))}
          </RadioButton.Group>

          <Text style={styles.sectionTitle}>Immeuble *</Text>
          <Picker
            selectedValue={formData.buildingId}
            onValueChange={(value) => setFormData({...formData, buildingId: value})}
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

          <TextInput
            label="Numéro d'appartement"
            value={formData.apartmentNumber}
            onChangeText={(text) => setFormData({...formData, apartmentNumber: text})}
            style={styles.input}
            mode="outlined"
          />

          <Button
            mode="contained"
            onPress={saveUser}
            loading={loading}
            disabled={loading}
            style={styles.saveButton}
          >
            {mode === 'create' ? 'Créer l\'utilisateur' : 'Modifier l\'utilisateur'}
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  formCard: { margin: 16 },
  input: { marginBottom: 16, backgroundColor: 'white' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  radioOption: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  picker: { backgroundColor: 'white', marginBottom: 16 },
  saveButton: { marginTop: 24 }
});
```

### Backend Implementation

#### Service Gestion Utilisateurs
```typescript
// src/modules/admin/user-management.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserAuditLog } from './entities/user-audit-log.entity';
import { EmailService } from '../../integrations/email/email.service';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserManagementService {
  private readonly logger = new Logger(UserManagementService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserAuditLog)
    private auditLogRepository: Repository<UserAuditLog>,
    private emailService: EmailService,
  ) {}

  async getUsers(
    managerId: string,
    filters: any,
    page: number = 1,
    limit: number = 20
  ): Promise<{ users: User[]; total: number }> {
    // Vérifier que le manager a accès aux utilisateurs
    const managedBuildings = await this.getManagedBuildings(managerId);

    const query = this.userRepository.createQueryBuilder('u')
      .leftJoinAndSelect('u.building', 'b')
      .where('u.deleted_at IS NULL')
      .andWhere('u.building_id IN (:...buildingIds)', { buildingIds: managedBuildings });

    if (filters.search) {
      query.andWhere(
        '(u.first_name ILIKE :search OR u.last_name ILIKE :search OR u.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    if (filters.role) {
      query.andWhere('u.role = :role', { role: filters.role });
    }

    if (filters.buildingId) {
      query.andWhere('u.building_id = :buildingId', { buildingId: filters.buildingId });
    }

    const [users, total] = await query
      .orderBy('u.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { users, total };
  }

  async createUser(managerId: string, userData: any): Promise<User> {
    // Vérifier l'accès à l'immeuble
    await this.verifyBuildingAccess(managerId, userData.buildingId);

    // Générer un mot de passe temporaire
    const tempPassword = this.generateTempPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    const user = this.userRepository.create({
      ...userData,
      password: hashedPassword,
      created_by: managerId
    });

    const savedUser = await this.userRepository.save(user);

    // Log de l'action
    await this.logAuditAction(managerId, 'create', null, savedUser);

    // Envoyer email de bienvenue avec mot de passe temporaire
    await this.sendWelcomeEmail(savedUser, tempPassword);

    return savedUser;
  }

  async updateUser(managerId: string, userId: string, updateData: any): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deleted_at: null },
      relations: ['building']
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Vérifier l'accès
    await this.verifyBuildingAccess(managerId, user.building_id);

    const oldValues = { ...user };
    Object.assign(user, updateData);
    user.updated_by = managerId;
    user.updated_at = new Date();

    const updatedUser = await this.userRepository.save(user);

    // Log de l'action
    await this.logAuditAction(managerId, 'update', oldValues, updatedUser);

    return updatedUser;
  }

  async deleteUser(managerId: string, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deleted_at: null }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Vérifier l'accès
    await this.verifyBuildingAccess(managerId, user.building_id);

    // Soft delete
    user.deleted_at = new Date();
    user.updated_by = managerId;
    await this.userRepository.save(user);

    // Log de l'action
    await this.logAuditAction(managerId, 'delete', user, null);
  }

  async resetPassword(managerId: string, userId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, deleted_at: null }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Vérifier l'accès
    await this.verifyBuildingAccess(managerId, user.building_id);

    // Générer token de reset
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    user.password_reset_token = resetToken;
    user.password_reset_expires = resetExpires;
    await this.userRepository.save(user);

    // Envoyer email de reset
    await this.sendPasswordResetEmail(user, resetToken);

    // Log de l'action
    await this.logAuditAction(managerId, 'password_reset', user, user);
  }

  async importUsers(managerId: string, csvData: string): Promise<{ created: number; updated: number; errors: string[] }> {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    const results = { created: 0, updated: 0, errors: [] };

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const userData = {};

        headers.forEach((header, index) => {
          userData[header] = values[index];
        });

        // Vérifier si l'utilisateur existe
        const existingUser = await this.userRepository.findOne({
          where: { email: userData['email'] }
        });

        if (existingUser) {
          await this.updateUser(managerId, existingUser.id, userData);
          results.updated++;
        } else {
          await this.createUser(managerId, userData);
          results.created++;
        }
      } catch (error) {
        results.errors.push(`Ligne ${i + 1}: ${error.message}`);
      }
    }

    return results;
  }

  private async getManagedBuildings(managerId: string): Promise<string[]> {
    // Retourner les IDs des immeubles gérés par le manager
    // Implémentation dépendante du modèle de données
    return ['building-1', 'building-2'];
  }

  private async verifyBuildingAccess(managerId: string, buildingId: string): Promise<void> {
    const managedBuildings = await this.getManagedBuildings(managerId);
    if (!managedBuildings.includes(buildingId)) {
      throw new Error('Access denied to this building');
    }
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-12) + 'Temp2024!';
  }

  private async logAuditAction(
    performedBy: string, 
    action: string, 
    oldValues: any, 
    newValues: any
  ): Promise<void> {
    const log = this.auditLogRepository.create({
      user_id: newValues?.id || oldValues?.id,
      action,
      old_values: oldValues,
      new_values: newValues,
      performed_by: performedBy
    });

    await this.auditLogRepository.save(log);
  }

  private async sendWelcomeEmail(user: User, tempPassword: string): Promise<void> {
    const subject = 'Bienvenue sur WaterHouse';
    const body = `
      Bonjour ${user.firstName},

      Votre compte WaterHouse a été créé.
      
      Email: ${user.email}
      Mot de passe temporaire: ${tempPassword}
      
      Veuillez changer votre mot de passe lors de votre première connexion.
      
      Cordialement,
      L'équipe WaterHouse
    `;

    await this.emailService.sendEmail(user.email, subject, body);
  }

  private async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const subject = 'Réinitialisation de votre mot de passe WaterHouse';
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    const body = `
      Bonjour ${user.firstName},

      Vous avez demandé la réinitialisation de votre mot de passe.
      
      Cliquez sur ce lien pour définir un nouveau mot de passe:
      ${resetUrl}
      
      Ce lien expire dans 24 heures.
      
      Cordialement,
      L'équipe WaterHouse
    `;

    await this.emailService.sendEmail(user.email, subject, body);
  }
}
```

### Testing Strategy

#### Unit Tests
```typescript
// src/modules/admin/user-management.service.spec.ts
describe('UserManagementService', () => {
  it('should create user with temporary password', async () => {
    // Test création utilisateur
  });

  it('should enforce building access control', async () => {
    // Test contrôle d'accès
  });

  it('should log audit actions', async () => {
    // Test audit logging
  });

  it('should handle CSV import', async () => {
    // Test import CSV
  });
});
```

#### E2E Tests (Playwright)
```typescript
// e2e/user-management.spec.ts
test('Manager can create and edit users', async ({ page }) => {
  // Test gestion utilisateurs
});

test('User role restrictions work correctly', async ({ page }) => {
  // Test restrictions par rôle
});
```

### Implementation Checklist
- [ ] Service UserManagement avec CRUD complet
- [ ] API endpoints pour gestion utilisateurs
- [ ] Composant liste utilisateurs avec filtres
- [ ] Composant formulaire création/édition
- [ ] Audit logging automatique
- [ ] Import/export CSV
- [ ] Réinitialisation mot de passe
- [ ] Contrôle d'accès par immeuble
- [ ] Tests unitaires et E2E
- [ ] Soft delete pour conformité RGPD

### Dependencies
- bcrypt pour hashage mots de passe
- csv-parser pour import CSV
- uuid pour tokens
- TypeORM pour base de données

### Risks & Mitigations
- **Risque**: Données sensibles exposées
  - **Mitigation**: Hashage mots de passe + audit logging
- **Risque**: Suppression accidentelle d'utilisateurs
  - **Mitigation**: Soft delete + confirmation requise
- **Risque**: Import CSV avec données invalides
  - **Mitigation**: Validation stricte + rollback partiel

### Performance Considerations
- Index optimisés pour recherche
- Pagination pour listes longues
- Cache pour données fréquemment consultées
- Background processing pour imports volumineux
- Cleanup automatique des anciens audit logs