import { greeting, createDiveraAlarm } from '../src/index';
import { DiveraService } from '../src/services/divera.service';
import { DiveraAlarmRequest } from '../src/types/divera';

// Mock the DiveraService
jest.mock('../src/services/divera.service');
const MockedDiveraService = DiveraService as jest.MockedClass<
  typeof DiveraService
>;

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

describe('Index functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('greeting function', () => {
    it('should return a greeting message', () => {
      const result = greeting('TypeScript');
      expect(result).toBe('Hello, TypeScript!');
    });

    it('should handle empty string', () => {
      const result = greeting('');
      expect(result).toBe('Hello, !');
    });
  });

  describe('createDiveraAlarm function', () => {
    let mockDiveraService: jest.Mocked<DiveraService>;

    beforeEach(() => {
      mockDiveraService = {
        createAlarm: jest.fn(),
        getApiKey: jest.fn().mockReturnValue('test...key'),
        validateApiKey: jest.fn(),
      } as any;

      MockedDiveraService.mockImplementation(() => mockDiveraService);
    });

    it('should create alarm successfully', async () => {
      const mockResponse = {
        success: true,
        alarm: {
          id: 12345,
          title: 'Test Alarm',
          created: '2023-10-03T10:00:00Z',
        },
      };

      mockDiveraService.createAlarm.mockResolvedValue(mockResponse);

      const alarmData: DiveraAlarmRequest = {
        title: 'Test Alarm',
        text: 'Test message',
      };

      await createDiveraAlarm(alarmData);

      expect(MockedDiveraService).toHaveBeenCalledTimes(1);
      expect(mockDiveraService.createAlarm).toHaveBeenCalledWith(alarmData);
      expect(consoleSpy.log).toHaveBeenCalledWith('Using API key: test...key');
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '✅ Alarm created successfully!'
      );
      expect(consoleSpy.log).toHaveBeenCalledWith('Alarm ID: 12345');
    });

    it('should handle failed alarm creation', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid API key',
      };

      mockDiveraService.createAlarm.mockResolvedValue(mockResponse);

      const alarmData: DiveraAlarmRequest = {
        title: 'Test Alarm',
      };

      await createDiveraAlarm(alarmData);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ Failed to create alarm:',
        'Invalid API key'
      );
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Network error');
      mockDiveraService.createAlarm.mockRejectedValue(mockError);

      const alarmData: DiveraAlarmRequest = {
        title: 'Test Alarm',
      };

      await createDiveraAlarm(alarmData);

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ Error creating alarm:',
        mockError
      );
    });
  });
});
