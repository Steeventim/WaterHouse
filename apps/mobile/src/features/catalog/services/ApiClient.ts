/**
 * API client service for WaterHouse mobile application
 * Handles HTTP communication with the backend API
 */

import axios, { AxiosInstance } from 'axios';
import { CatalogSyncData, UserAssignments } from '../../common/types/sync.types';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ApiClient {
  private client: AxiosInstance;

  constructor(config: ApiClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...(config.headers || {}),
      },
    });
  }

  /**
   * Get catalog sync data from API
   */
  async getCatalogSync(params: {
    lastSync?: string;
    userId?: string;
  }): Promise<CatalogSyncData> {
    try {
      const response = await this.client.get<CatalogSyncData>('/sync', {
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get catalog sync data:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get user assignments from API
   */
  async getUserAssignments(
    userId: string
  ): Promise<UserAssignments> {
    try {
      const response = await this.client.get<UserAssignments>(
        '/user-assignments',
        {
          params: { userId },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get user assignments:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Set authorization header
   */
  setAuthToken(token: string): void {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Remove authorization header
   */
  removeAuthToken(): void {
    delete this.client.defaults.headers.common['Authorization'];
  }

  /**
   * Handle API errors
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return new Error(
          `API Error: ${error.response.status} - ${error.response.statusText}`
        );
      } else if (error.request) {
        return new Error('Network Error: No response from server');
      }
    }
    return new Error('Unknown API Error');
  }
}
