/**
 * Unit tests for ApiClient service
 */

import { ApiClient } from '../services/ApiClient';
import axios from 'axios';
import { CatalogSyncData } from '../../common/types/sync.types';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ApiClient', () => {
  let apiClient: ApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      defaults: {
        headers: {
          common: {},
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    apiClient = new ApiClient({
      baseURL: 'http://api.example.com/api/v1/catalog',
      timeout: 30000,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://api.example.com/api/v1/catalog',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should merge custom headers', () => {
      mockedAxios.create.mockClear();

      const customHeaders = { 'X-Custom': 'value' };
      new ApiClient({
        baseURL: 'http://api.example.com',
        headers: customHeaders,
      });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining(customHeaders),
        })
      );
    });
  });

  describe('getCatalogSync', () => {
    it('should fetch catalog sync data', async () => {
      const syncData: CatalogSyncData = {
        buildings: [],
        apartments: [],
        meters: [],
        syncTimestamp: '2026-01-27T10:00:00Z',
        totalRecords: 0,
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: syncData,
      });

      const result = await apiClient.getCatalogSync({
        userId: 'user_123',
        lastSync: '2026-01-26T00:00:00Z',
      });

      expect(result).toEqual(syncData);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/sync', {
        params: {
          userId: 'user_123',
          lastSync: '2026-01-26T00:00:00Z',
        },
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(
        apiClient.getCatalogSync({ userId: 'user_123' })
      ).rejects.toThrow();
    });

    it('should handle axios errors with response', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: {
          status: 401,
          statusText: 'Unauthorized',
        },
        isAxiosError: true,
      });

      await expect(
        apiClient.getCatalogSync({ userId: 'user_123' })
      ).rejects.toThrow('API Error: 401 - Unauthorized');
    });
  });

  describe('getUserAssignments', () => {
    it('should fetch user assignments', async () => {
      const assignments = {
        userId: 'user_123',
        assignedBuildings: ['build_123'],
        assignedApartments: ['apt_123'],
        lastAssignmentUpdate: '2026-01-27T10:00:00Z',
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: assignments,
      });

      const result = await apiClient.getUserAssignments('user_123');

      expect(result).toEqual(assignments);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(
        '/user-assignments',
        {
          params: { userId: 'user_123' },
        }
      );
    });

    it('should handle errors when fetching assignments', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(
        apiClient.getUserAssignments('user_123')
      ).rejects.toThrow();
    });
  });

  describe('auth token management', () => {
    it('should set authorization token', () => {
      apiClient.setAuthToken('token_123');

      expect(mockAxiosInstance.defaults.headers.common['Authorization']).toBe(
        'Bearer token_123'
      );
    });

    it('should remove authorization token', () => {
      apiClient.setAuthToken('token_123');
      apiClient.removeAuthToken();

      expect(
        mockAxiosInstance.defaults.headers.common['Authorization']
      ).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle axios error with request but no response', async () => {
      mockAxiosInstance.get.mockRejectedValue({
        request: {},
        isAxiosError: true,
      });

      await expect(
        apiClient.getCatalogSync({ userId: 'user_123' })
      ).rejects.toThrow('Network Error: No response from server');
    });

    it('should handle unknown errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Unknown error'));

      await expect(
        apiClient.getCatalogSync({ userId: 'user_123' })
      ).rejects.toThrow('Unknown API Error');
    });
  });
});
