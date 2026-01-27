# Story 7-2: Visualisation des Photos de Relevés

## Story Header
- **Story ID**: 7-2
- **Key**: WH-7-2
- **Epic**: Epic 7 - Interface Web de Gestion
- **Title**: Visualisation des Photos de Relevés
- **Status**: Ready for Dev
- **Assignee**: TBD
- **Created Date**: 2026-01-26
- **Updated Date**: 2026-01-26
- **Story Points**: 5

## User Story
En tant que **gestionnaire d'immeuble**, je veux **visualiser les photos des compteurs** afin que **je puisse vérifier la qualité des relevés et détecter les anomalies**.

En tant que **gestionnaire d'immeuble**, je veux **zoomer et faire pivoter les photos** afin que **je puisse examiner les détails du compteur**.

## Acceptance Criteria
### Fonctionnel
- [ ] Affichage des photos en haute résolution
- [ ] Zoom avant/arrière et panoramique
- [ ] Rotation des images
- [ ] Comparaison côte à côte avec relevés précédents
- [ ] Indicateur de qualité d'image
- [ ] Téléchargement des photos
- [ ] Support des formats JPEG, PNG, WebP

### Non-Fonctionnel
- [ ] Temps de chargement < 3 secondes
- [ ] Interface fluide sur desktop et mobile
- [ ] Optimisation mémoire pour grandes images
- [ ] Cache intelligent des images

## Technical Requirements

### Architecture Context
- **Bounded Context**: Management & Media
- **Integration Points**: File Storage (Supabase), Reading Service
- **Security**: Accès sécurisé aux photos, watermark optionnel
- **Performance**: Lazy loading, compression, CDN

### API Endpoints

#### Backend (NestJS)
```typescript
// URL sécurisée pour accès photo
GET /api/media/readings/{readingId}/photo
Authorization: Bearer {manager-token}
Query: ?size={original|medium|thumbnail}

// Métadonnées de la photo
GET /api/media/readings/{readingId}/photo-metadata
Authorization: Bearer {manager-token}

// Comparaison photos
GET /api/media/readings/{readingId}/photo-comparison
Authorization: Bearer {manager-token}
Response: { current: {url, metadata}, previous: {url, metadata} }
```

### Web Implementation (React)

#### Composant Visionneuse Photo
```typescript
// src/components/management/PhotoViewer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, PanResponder, Animated } from 'react-native';
import { Modal, IconButton, Text, ActivityIndicator } from 'react-native-paper';
import { PinchGestureHandler, State } from 'react-native-gesture-handler';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PhotoViewerProps {
  visible: boolean;
  onDismiss: () => void;
  photoUrl: string;
  metadata?: any;
  onZoom?: (scale: number) => void;
  onRotate?: (rotation: number) => void;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  visible,
  onDismiss,
  photoUrl,
  metadata,
  onZoom,
  onRotate
}) => {
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const panAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      if (scale > 1) {
        panAnim.setValue({
          x: gestureState.dx,
          y: gestureState.dy
        });
      }
    },
    onPanResponderRelease: () => {
      // Snap back to bounds if needed
      Animated.spring(panAnim, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: false
      }).start();
    }
  });

  const onPinchGestureEvent = (event: any) => {
    const newScale = event.nativeEvent.scale;
    setScale(newScale);
    onZoom?.(newScale);
  };

  const onPinchHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      // Constrain scale between 0.5 and 4
      const constrainedScale = Math.max(0.5, Math.min(4, scale));
      setScale(constrainedScale);
      
      Animated.spring(scaleAnim, {
        toValue: constrainedScale,
        useNativeDriver: false
      }).start();
    }
  };

  const rotateImage = (direction: 'left' | 'right') => {
    const increment = direction === 'left' ? -90 : 90;
    const newRotation = (rotation + increment) % 360;
    setRotation(newRotation);
    onRotate?.(newRotation);

    Animated.spring(rotateAnim, {
      toValue: newRotation,
      useNativeDriver: false
    }).start();
  };

  const resetView = () => {
    setScale(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
    
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: false }),
      Animated.spring(rotateAnim, { toValue: 0, useNativeDriver: false }),
      Animated.spring(panAnim, { toValue: { x: 0, y: 0 }, useNativeDriver: false })
    ]).start();
  };

  const downloadPhoto = async () => {
    try {
      // Implémentation du téléchargement
      const response = await fetch(photoUrl);
      const blob = await response.blob();
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `releve-${Date.now()}.jpg`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Modal visible={visible} onDismiss={onDismiss} style={styles.modal}>
      <View style={styles.container}>
        {/* Header avec contrôles */}
        <View style={styles.header}>
          <IconButton icon="close" onPress={onDismiss} />
          <View style={styles.controls}>
            <IconButton icon="rotate-left" onPress={() => rotateImage('left')} />
            <IconButton icon="rotate-right" onPress={() => rotateImage('right')} />
            <IconButton icon="refresh" onPress={resetView} />
            <IconButton icon="download" onPress={downloadPhoto} />
          </View>
        </View>

        {/* Métadonnées */}
        {metadata && (
          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              Résolution: {metadata.width}x{metadata.height}
            </Text>
            <Text style={styles.metadataText}>
              Taille: {(metadata.size / 1024).toFixed(1)} KB
            </Text>
            <Text style={styles.metadataText}>
              Date: {new Date(metadata.timestamp).toLocaleString('fr-FR')}
            </Text>
          </View>
        )}

        {/* Visionneuse d'image */}
        <View style={styles.viewerContainer} {...panResponder.panHandlers}>
          <PinchGestureHandler
            onGestureEvent={onPinchGestureEvent}
            onHandlerStateChange={onPinchHandlerStateChange}
          >
            <Animated.Image
              source={{ uri: photoUrl }}
              style={[
                styles.image,
                {
                  transform: [
                    { scale: scaleAnim },
                    { rotate: rotateAnim.interpolate({
                      inputRange: [0, 360],
                      outputRange: ['0deg', '360deg']
                    })},
                    { translateX: panAnim.x },
                    { translateY: panAnim.y }
                  ]
                }
              ]}
              resizeMode="contain"
              onLoadStart={() => setLoading(true)}
              onLoadEnd={() => setLoading(false)}
            />
          </PinchGestureHandler>
          
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" />
            </View>
          )}
        </View>

        {/* Indicateur de zoom */}
        <View style={styles.zoomIndicator}>
          <Text style={styles.zoomText}>{(scale * 100).toFixed(0)}%</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { 
    margin: 0,
    backgroundColor: 'rgba(0,0,0,0.9)'
  },
  container: { 
    flex: 1,
    backgroundColor: 'black'
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  controls: { flexDirection: 'row' },
  metadata: { 
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  metadataText: { 
    color: 'white', 
    fontSize: 12 
  },
  viewerContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
    maxWidth: SCREEN_WIDTH,
    maxHeight: SCREEN_HEIGHT * 0.7
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)'
  },
  zoomIndicator: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4
  },
  zoomText: { 
    color: 'white', 
    fontSize: 14, 
    fontWeight: 'bold' 
  }
});
```

#### Composant Comparaison Photos
```typescript
// src/components/management/PhotoComparison.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Card, Text, Button, Slider } from 'react-native-paper';
import { PhotoViewer } from './PhotoViewer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PhotoComparisonProps {
  readingId: string;
  onPhotoSelect?: (photoUrl: string) => void;
}

export const PhotoComparison: React.FC<PhotoComparisonProps> = ({
  readingId,
  onPhotoSelect
}) => {
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [splitPosition, setSplitPosition] = useState(50);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [viewerVisible, setViewerVisible] = useState(false);

  useEffect(() => {
    loadComparisonData();
  }, [readingId]);

  const loadComparisonData = async () => {
    try {
      const response = await api.get(`/media/readings/${readingId}/photo-comparison`);
      setComparisonData(response.data);
    } catch (error) {
      console.error('Failed to load comparison:', error);
    }
  };

  const openPhotoViewer = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
    setViewerVisible(true);
    onPhotoSelect?.(photoUrl);
  };

  if (!comparisonData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement de la comparaison...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Card style={styles.comparisonCard}>
        <Card.Title title="Comparaison des photos" />
        <Card.Content>
          {/* Contrôle du split */}
          <View style={styles.splitControl}>
            <Text style={styles.splitLabel}>Position du curseur:</Text>
            <Slider
              value={splitPosition}
              onValueChange={setSplitPosition}
              minimumValue={0}
              maximumValue={100}
              step={1}
              style={styles.slider}
            />
            <Text style={styles.splitValue}>{splitPosition}%</Text>
          </View>

          {/* Zone de comparaison */}
          <View style={styles.comparisonContainer}>
            <View style={[styles.photoContainer, { width: `${splitPosition}%` }]}>
              <Text style={styles.photoLabel}>Relevé actuel</Text>
              <TouchableOpacity 
                style={styles.photoWrapper}
                onPress={() => openPhotoViewer(comparisonData.current.url)}
              >
                <Image
                  source={{ uri: comparisonData.current.url }}
                  style={styles.comparisonImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              
              <View style={styles.photoInfo}>
                <Text style={styles.infoText}>
                  {new Date(comparisonData.current.metadata.timestamp).toLocaleDateString('fr-FR')}
                </Text>
                <Text style={styles.infoText}>
                  {comparisonData.current.metadata.width}x{comparisonData.current.metadata.height}
                </Text>
              </View>
            </View>

            <View style={[styles.photoContainer, { width: `${100 - splitPosition}%` }]}>
              <Text style={styles.photoLabel}>Relevé précédent</Text>
              <TouchableOpacity 
                style={styles.photoWrapper}
                onPress={() => openPhotoViewer(comparisonData.previous.url)}
              >
                <Image
                  source={{ uri: comparisonData.previous.url }}
                  style={styles.comparisonImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
              
              <View style={styles.photoInfo}>
                <Text style={styles.infoText}>
                  {new Date(comparisonData.previous.metadata.timestamp).toLocaleDateString('fr-FR-R')}
                </Text>
                <Text style={styles.infoText}>
                  {comparisonData.previous.metadata.width}x{comparisonData.previous.metadata.height}
                </Text>
              </View>
            </View>
          </View>

          {/* Boutons d'action */}
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => openPhotoViewer(comparisonData.current.url)}
              style={styles.actionButton}
            >
              Voir actuel en détail
            </Button>
            <Button
              mode="outlined"
              onPress={() => openPhotoViewer(comparisonData.previous.url)}
              style={styles.actionButton}
            >
              Voir précédent en détail
            </Button>
          </View>
        </Card.Content>
      </Card>

      {/* Visionneuse modale */}
      <PhotoViewer
        visible={viewerVisible}
        onDismiss={() => setViewerVisible(false)}
        photoUrl={selectedPhoto || ''}
        metadata={selectedPhoto === comparisonData?.current.url ? 
          comparisonData.current.metadata : comparisonData?.previous.metadata}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  comparisonCard: { margin: 16 },
  splitControl: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16,
    paddingHorizontal: 16
  },
  splitLabel: { flex: 1, fontSize: 14 },
  slider: { flex: 2, marginHorizontal: 16 },
  splitValue: { fontSize: 14, fontWeight: 'bold', minWidth: 40, textAlign: 'right' },
  comparisonContainer: { 
    flexDirection: 'row',
    height: 300,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden'
  },
  photoContainer: { 
    position: 'relative',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0'
  },
  photoLabel: { 
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: 'white',
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
    zIndex: 1
  },
  photoWrapper: { flex: 1 },
  comparisonImage: { 
    width: '100%', 
    height: '100%' 
  },
  photoInfo: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 4
  },
  infoText: { 
    color: 'white', 
    fontSize: 12,
    textAlign: 'center'
  },
  actionButtons: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginTop: 16
  },
  actionButton: { flex: 1, marginHorizontal: 8 }
});
```

### Backend Implementation

#### Service Media
```typescript
// src/modules/media/media.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reading } from '../reading/entities/reading.entity';
import { createReadStream } from 'fs';
import { SupabaseService } from '../../integrations/supabase/supabase.service';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(Reading)
    private readingRepository: Repository<Reading>,
    private supabaseService: SupabaseService,
  ) {}

  async getReadingPhotoUrl(
    readingId: string, 
    userId: string, 
    size: 'original' | 'medium' | 'thumbnail' = 'medium'
  ): Promise<string> {
    // Vérifier l'accès à la lecture
    const reading = await this.readingRepository.findOne({
      where: { id: readingId },
      relations: ['meter', 'meter.apartment', 'meter.apartment.building']
    });

    if (!reading) {
      throw new Error('Reading not found');
    }

    // Vérifier les permissions (manager de l'immeuble)
    await this.verifyAccess(userId, reading.meter.apartment.building.id);

    if (!reading.photo_url) {
      throw new Error('No photo available for this reading');
    }

    // Générer URL signée depuis Supabase
    const filePath = this.getFilePath(reading.photo_url, size);
    return this.supabaseService.getSignedUrl(filePath, 3600); // 1 heure
  }

  async getPhotoMetadata(readingId: string, userId: string): Promise<any> {
    const reading = await this.readingRepository.findOne({
      where: { id: readingId }
    });

    if (!reading || !reading.photo_metadata) {
      throw new Error('Photo metadata not available');
    }

    await this.verifyAccess(userId, reading.meter.apartment.building.id);

    return reading.photo_metadata;
  }

  async getPhotoComparison(readingId: string, userId: string): Promise<any> {
    const currentReading = await this.readingRepository.findOne({
      where: { id: readingId },
      relations: ['meter']
    });

    if (!currentReading) {
      throw new Error('Reading not found');
    }

    await this.verifyAccess(userId, currentReading.meter.apartment.building.id);

    // Trouver le relevé précédent pour le même compteur
    const previousReading = await this.readingRepository
      .createQueryBuilder('r')
      .where('r.meter_id = :meterId', { meterId: currentReading.meter_id })
      .andWhere('r.submitted_at < :currentDate', { currentDate: currentReading.submitted_at })
      .andWhere('r.photo_url IS NOT NULL')
      .orderBy('r.submitted_at', 'DESC')
      .limit(1)
      .getOne();

    if (!previousReading) {
      throw new Error('No previous reading with photo found');
    }

    return {
      current: {
        url: await this.getReadingPhotoUrl(readingId, userId, 'medium'),
        metadata: currentReading.photo_metadata
      },
      previous: {
        url: await this.getReadingPhotoUrl(previousReading.id, userId, 'medium'),
        metadata: previousReading.photo_metadata
      }
    };
  }

  private async verifyAccess(userId: string, buildingId: string): Promise<void> {
    // Vérifier que l'utilisateur est manager de l'immeuble
    // Implémentation dépendante du modèle de données des managers
    const isManager = await this.checkBuildingManagerAccess(userId, buildingId);
    if (!isManager) {
      throw new Error('Access denied');
    }
  }

  private getFilePath(originalUrl: string, size: string): string {
    // Extraire le chemin du fichier depuis l'URL
    const urlParts = originalUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const baseName = filename.split('.')[0];
    const extension = filename.split('.')[1];

    switch (size) {
      case 'thumbnail':
        return `readings/thumbnails/${baseName}_thumb.${extension}`;
      case 'medium':
        return `readings/medium/${baseName}_medium.${extension}`;
      default:
        return `readings/original/${filename}`;
    }
  }

  private async checkBuildingManagerAccess(userId: string, buildingId: string): Promise<boolean> {
    // Implémentation de la vérification d'accès
    // Retourner true si l'utilisateur gère l'immeuble
    return true; // Placeholder
  }
}
```

### Testing Strategy

#### Unit Tests
```typescript
// src/modules/media/media.service.spec.ts
describe('MediaService', () => {
  it('should generate signed URL for photo access', async () => {
    // Test génération URL signée
  });

  it('should enforce access control', async () => {
    // Test contrôle d'accès
  });

  it('should return photo comparison data', async () => {
    // Test comparaison photos
  });
});
```

#### E2E Tests (Playwright)
```typescript
// e2e/photo-viewer.spec.ts
test('Manager can view reading photos', async ({ page }) => {
  // Test visionneuse photos
});

test('Photo comparison works correctly', async ({ page }) => {
  // Test comparaison photos
});
```

### Implementation Checklist
- [ ] Service Media avec génération URLs signées
- [ ] API endpoints pour photos et métadonnées
- [ ] Composant PhotoViewer avec zoom/pan/rotation
- [ ] Composant PhotoComparison avec split view
- [ ] Intégration Supabase pour stockage
- [ ] Contrôle d'accès par immeuble
- [ ] Génération automatique des thumbnails
- [ ] Tests unitaires et E2E
- [ ] Optimisation performance images

### Dependencies
- React Native Gesture Handler pour gestes
- React Native Image Viewer pour visionneuse
- Supabase client pour stockage
- React Native FS pour téléchargement

### Risks & Mitigations
- **Risque**: Images lourdes impactant performance
  - **Mitigation**: Compression automatique + lazy loading
- **Risque**: URLs signées expirées
  - **Mitigation**: Régénération automatique + cache
- **Risque**: Accès non autorisé aux photos
  - **Mitigation**: Vérification stricte des permissions

### Performance Considerations
- Génération de thumbnails lors upload
- Cache des URLs signées
- Lazy loading des images
- Compression progressive
- CDN pour distribution