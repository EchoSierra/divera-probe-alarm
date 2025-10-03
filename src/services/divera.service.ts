import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { config } from 'dotenv';
import {
  DiveraAlarmRequest,
  DiveraAlarmResponse,
  DiveraApiError,
} from '../types/divera';

// Load environment variables
config();

export class DiveraService {
  private readonly apiClient: AxiosInstance;
  private readonly apiKey: string;

  constructor(apiKey?: string, baseURL?: string) {
    this.apiKey = apiKey || process.env.DIVERA_WEB_API_KEY || '';

    if (!this.apiKey) {
      throw new Error(
        'Divera API key is required. Set DIVERA_WEB_API_KEY environment variable or pass it as parameter.'
      );
    }

    this.apiClient = axios.create({
      baseURL:
        baseURL ||
        process.env.DIVERA_API_BASE_URL ||
        'https://api.divera247.com/api/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Creates a new alarm in Divera247
   * @param alarmData - The alarm data to send
   * @returns Promise with the alarm response
   */
  async createAlarm(
    alarmData: DiveraAlarmRequest
  ): Promise<DiveraAlarmResponse> {
    try {
      const response: AxiosResponse<DiveraAlarmResponse> =
        await this.apiClient.post('/alarm', {
          ...alarmData,
          access_key: this.apiKey,
        });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorResponse: DiveraApiError = {
          success: false,
          error: error.response?.data?.error || error.message,
          message: error.response?.data?.message || 'Failed to create alarm',
        };
        throw errorResponse;
      }

      throw {
        success: false,
        error: 'Unknown error occurred',
        message: error instanceof Error ? error.message : 'Unknown error',
      } as DiveraApiError;
    }
  }

  /**
   * Validates the API key by making a test request
   * @returns Promise<boolean> - true if API key is valid
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Make a simple request to validate the API key
      await this.apiClient.get('/status', {
        params: {
          access_key: this.apiKey,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Gets the current API key (masked for security)
   * @returns string - masked API key
   */
  getApiKey(): string {
    if (!this.apiKey) return '';
    return this.apiKey.length > 8
      ? `${this.apiKey.substring(0, 4)}...${this.apiKey.substring(
          this.apiKey.length - 4
        )}`
      : '****';
  }
}

export default DiveraService;
