import axios from 'axios';
import { DiveraService } from '../src/services/divera.service';
import { DiveraAlarmRequest } from '../src/types/divera';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

// Create a mock axios instance
const createMockAxiosInstance = () => ({
  post: jest.fn(),
  get: jest.fn(),
});

describe('DiveraService', () => {
  let diveraService: DiveraService;
  let mockAxiosInstance: ReturnType<typeof createMockAxiosInstance>;
  const mockApiKey = 'test-api-key-12345678';

  beforeEach(() => {
    jest.clearAllMocks();

    mockAxiosInstance = createMockAxiosInstance();
    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });
  describe('constructor', () => {
    it('should create instance with provided API key', () => {
      const service = new DiveraService(mockApiKey);
      expect(service.getApiKey()).toBe('test...5678');
    });

    it('should use environment variable if no API key provided', () => {
      process.env.DIVERA_WEB_API_KEY = mockApiKey;
      const service = new DiveraService();
      expect(service.getApiKey()).toBe('test...5678');
    });

    it('should throw error if no API key is available', () => {
      delete process.env.DIVERA_WEB_API_KEY;
      expect(() => new DiveraService()).toThrow(
        'Divera API key is required. Set DIVERA_WEB_API_KEY environment variable or pass it as parameter.'
      );
    });

    it('should use custom base URL if provided', () => {
      const customBaseURL = 'https://custom-api.example.com';
      new DiveraService(mockApiKey, customBaseURL);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: customBaseURL,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('createAlarm', () => {
    beforeEach(() => {
      diveraService = new DiveraService(mockApiKey);
    });

    it('should create alarm successfully', async () => {
      const mockResponse = {
        data: {
          success: true,
          alarm: {
            id: 12345,
            title: 'Test Alarm',
            foreign_id: 'test-123',
            created: '2023-10-03T10:00:00Z',
          },
        },
      };

      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const alarmData: DiveraAlarmRequest = {
        title: 'Test Alarm',
        text: 'Test alarm text',
        priority: 1,
        foreign_id: 'test-123',
      };

      const result = await diveraService.createAlarm(alarmData);

      expect(result).toEqual(mockResponse.data);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/alarm', {
        ...alarmData,
        access_key: mockApiKey,
      });
    });

    it('should handle API error response', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Invalid API key',
            message: 'The provided API key is not valid',
          },
        },
        message: 'Request failed with status code 401',
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as jest.Mock).mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      const alarmData: DiveraAlarmRequest = {
        title: 'Test Alarm',
      };

      await expect(diveraService.createAlarm(alarmData)).rejects.toEqual({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is not valid',
      });
    });

    it('should handle network error', async () => {
      const mockError = {
        message: 'Network Error',
      };

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as jest.Mock).mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(true);

      const alarmData: DiveraAlarmRequest = {
        title: 'Test Alarm',
      };

      await expect(diveraService.createAlarm(alarmData)).rejects.toEqual({
        success: false,
        error: 'Network Error',
        message: 'Failed to create alarm',
      });
    });

    it('should handle unknown error', async () => {
      const mockError = new Error('Unknown error');

      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.post as jest.Mock).mockRejectedValue(mockError);
      mockedAxios.isAxiosError.mockReturnValue(false);

      const alarmData: DiveraAlarmRequest = {
        title: 'Test Alarm',
      };

      await expect(diveraService.createAlarm(alarmData)).rejects.toEqual({
        success: false,
        error: 'Unknown error occurred',
        message: 'Unknown error',
      });
    });
  });

  describe('validateApiKey', () => {
    beforeEach(() => {
      diveraService = new DiveraService(mockApiKey);
    });

    it('should return true for valid API key', async () => {
      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.get as jest.Mock).mockResolvedValue({
        data: { success: true },
      });

      const result = await diveraService.validateApiKey();

      expect(result).toBe(true);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/status', {
        params: {
          access_key: mockApiKey,
        },
      });
    });

    it('should return false for invalid API key', async () => {
      const mockAxiosInstance = mockedAxios.create();
      (mockAxiosInstance.get as jest.Mock).mockRejectedValue(
        new Error('Unauthorized')
      );

      const result = await diveraService.validateApiKey();

      expect(result).toBe(false);
    });
  });

  describe('getApiKey', () => {
    it('should return masked API key for long keys', () => {
      const service = new DiveraService('very-long-api-key-123456789');
      expect(service.getApiKey()).toBe('very...6789');
    });

    it('should return masked API key for short keys', () => {
      const service = new DiveraService('short');
      expect(service.getApiKey()).toBe('****');
    });

    it('should return empty string for empty API key', () => {
      // This test won't work in practice since constructor throws, but good for completeness
      const service = new DiveraService('temp');
      // Manually set empty key for testing
      (service as any).apiKey = '';
      expect(service.getApiKey()).toBe('');
    });
  });
});
