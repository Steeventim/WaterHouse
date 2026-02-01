/**
 * Tests for PhotoStorage
 */

import { PhotoStorage, StoredPhoto } from '../services/PhotoStorage';
import { PhotoMetadata } from '../services/CameraService';
import RNFS from 'react-native-fs';

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  exists: jest.fn(),
  mkdir: jest.fn(),
  copyFile: jest.fn(),
  readDir: jest.fn(),
  unlink: jest.fn(),
  readFile: jest.fn(),
  writeFile: jest.fn(),
}));

describe('PhotoStorage', () => {
  const mockPhoto: PhotoMetadata = {
    uri: 'file:///temp/photo.jpg',
    width: 1920,
    height: 1080,
    fileSize: 2 * 1024 * 1024,
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should create directory if not exists', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValue(false);

      await PhotoStorage.initialize();

      expect(RNFS.mkdir).toHaveBeenCalledWith(
        expect.stringContaining('meter_photos')
      );
    });

    it('should not create directory if already exists', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValue(true);

      await PhotoStorage.initialize();

      expect(RNFS.mkdir).not.toHaveBeenCalled();
    });
  });

  describe('savePhoto', () => {
    it('should save photo and create index entry', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValue(true);
      (RNFS.readDir as jest.Mock).mockResolvedValue([]);
      (RNFS.readFile as jest.Mock).mockResolvedValue('[]');
      (RNFS.copyFile as jest.Mock).mockResolvedValue(undefined);
      (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await PhotoStorage.savePhoto(mockPhoto, 'meter-123');

      expect(result).toMatchObject({
        meterId: 'meter-123',
        metadata: expect.objectContaining({
          width: 1920,
          height: 1080,
        }),
      });
      expect(RNFS.copyFile).toHaveBeenCalled();
      expect(RNFS.writeFile).toHaveBeenCalled();
    });

    it('should reject when storage quota exceeded', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValue(true);
      (RNFS.readDir as jest.Mock).mockResolvedValue(
        Array(100).fill({ size: 6 * 1024 * 1024 }) // 600MB total
      );

      await expect(
        PhotoStorage.savePhoto(mockPhoto, 'meter-123')
      ).rejects.toThrow('Storage quota exceeded');
    });
  });

  describe('getStorageUsage', () => {
    it('should calculate storage usage correctly', async () => {
      const mockFiles = [
        { size: 2 * 1024 * 1024 }, // 2MB
        { size: 3 * 1024 * 1024 }, // 3MB
        { size: 5 * 1024 * 1024 }, // 5MB
      ];
      (RNFS.readDir as jest.Mock).mockResolvedValue(mockFiles);

      const usage = await PhotoStorage.getStorageUsage();

      expect(usage.usedMB).toBe(10);
      expect(usage.totalMB).toBe(500);
      expect(usage.percentage).toBe(2);
    });

    it('should return zero usage on error', async () => {
      (RNFS.readDir as jest.Mock).mockRejectedValue(new Error('Read error'));

      const usage = await PhotoStorage.getStorageUsage();

      expect(usage.usedMB).toBe(0);
      expect(usage.percentage).toBe(0);
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo file and remove from index', async () => {
      const mockStoredPhoto: StoredPhoto = {
        id: 'photo-123',
        meterId: 'meter-123',
        metadata: mockPhoto,
        encryptedPath: '/path/to/photo.jpg',
        createdAt: new Date().toISOString(),
      };

      (RNFS.exists as jest.Mock).mockResolvedValue(true);
      (RNFS.readFile as jest.Mock).mockResolvedValue(
        JSON.stringify([mockStoredPhoto])
      );
      (RNFS.unlink as jest.Mock).mockResolvedValue(undefined);
      (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);

      const result = await PhotoStorage.deletePhoto('photo-123');

      expect(result).toBe(true);
      expect(RNFS.unlink).toHaveBeenCalledWith('/path/to/photo.jpg');
      expect(RNFS.writeFile).toHaveBeenCalled();
    });

    it('should return false if photo not found', async () => {
      (RNFS.exists as jest.Mock).mockResolvedValue(true);
      (RNFS.readFile as jest.Mock).mockResolvedValue('[]');

      const result = await PhotoStorage.deletePhoto('nonexistent');

      expect(result).toBe(false);
      expect(RNFS.unlink).not.toHaveBeenCalled();
    });
  });

  describe('cleanupOldPhotos', () => {
    it('should delete photos older than 30 days with readingId', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 35);

      const mockPhotos: StoredPhoto[] = [
        {
          id: 'old-1',
          meterId: 'meter-1',
          readingId: 'reading-1',
          metadata: mockPhoto,
          encryptedPath: '/path/old-1.jpg',
          createdAt: oldDate.toISOString(),
        },
        {
          id: 'recent-1',
          meterId: 'meter-2',
          readingId: 'reading-2',
          metadata: mockPhoto,
          encryptedPath: '/path/recent-1.jpg',
          createdAt: new Date().toISOString(),
        },
      ];

      (RNFS.exists as jest.Mock).mockResolvedValue(true);
      (RNFS.readFile as jest.Mock).mockResolvedValue(JSON.stringify(mockPhotos));
      (RNFS.unlink as jest.Mock).mockResolvedValue(undefined);
      (RNFS.writeFile as jest.Mock).mockResolvedValue(undefined);

      const deletedCount = await PhotoStorage.cleanupOldPhotos();

      expect(deletedCount).toBe(1);
      expect(RNFS.unlink).toHaveBeenCalledWith('/path/old-1.jpg');
    });
  });
});
