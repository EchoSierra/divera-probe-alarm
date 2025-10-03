import {
  greeting,
  createDiveraAlarm,
  getAlarmConfigFromEnv,
  getCronConfigFromEnv,
} from '../src/index';
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

  describe('getAlarmConfigFromEnv function', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should use environment variables when available', () => {
      process.env.ALARM_TITLE = 'Custom Alarm Title';
      process.env.ALARM_TEXT = 'Custom alarm text';
      process.env.ALARM_PRIORITY = '3';
      process.env.ALARM_ADDRESS = 'Custom Address';

      const config = getAlarmConfigFromEnv();

      expect(config.title).toBe('Custom Alarm Title');
      expect(config.text).toBe('Custom alarm text');
      expect(config.priority).toBe(3);
      expect(config.address).toBe('Custom Address');
      expect(config.announcement).toBe(false);
      expect(config.foreign_id).toMatch(/^alarm-\d+$/);
    });

    it('should use default values when environment variables are not set', () => {
      delete process.env.ALARM_TITLE;
      delete process.env.ALARM_TEXT;
      delete process.env.ALARM_PRIORITY;
      delete process.env.ALARM_ADDRESS;

      const config = getAlarmConfigFromEnv();

      expect(config.title).toBe('Test Alarm from Node.js Service');
      expect(config.text).toBe(
        'This is a test alarm created by the Divera Probe Alarm service.'
      );
      expect(config.priority).toBe(1);
      expect(config.address).toBe('Test Address, Test City');
      expect(config.announcement).toBe(false);
      expect(config.foreign_id).toMatch(/^alarm-\d+$/);
    });

    it('should handle invalid priority values', () => {
      process.env.ALARM_PRIORITY = 'invalid';

      const config = getAlarmConfigFromEnv();

      expect(config.priority).toBeNaN();
    });

    it('should generate unique foreign_id for each call', async () => {
      const config1 = getAlarmConfigFromEnv();
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 1));
      const config2 = getAlarmConfigFromEnv();

      expect(config1.foreign_id).not.toBe(config2.foreign_id);
      expect(config1.foreign_id).toMatch(/^alarm-\d+$/);
      expect(config2.foreign_id).toMatch(/^alarm-\d+$/);
    });
  });

  describe('getCronConfigFromEnv function', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it('should use environment variables when available', () => {
      process.env.CRON_PATTERN = '0 8 * * 1';
      process.env.CRON_TIMEZONE = 'Europe/Paris';
      process.env.CRON_ENABLED = 'true';

      const config = getCronConfigFromEnv();

      expect(config.pattern).toBe('0 8 * * 1');
      expect(config.timezone).toBe('Europe/Paris');
      expect(config.enabled).toBe(true);
    });

    it('should use default values when environment variables are not set', () => {
      delete process.env.CRON_PATTERN;
      delete process.env.CRON_TIMEZONE;
      delete process.env.CRON_ENABLED;

      const config = getCronConfigFromEnv();

      expect(config.pattern).toBe('40 11 * * 6'); // Saturday 11:40 AM
      expect(config.timezone).toBe('Europe/Berlin');
      expect(config.enabled).toBe(false);
    });

    it('should handle different enabled values', () => {
      process.env.CRON_ENABLED = '1';
      let config = getCronConfigFromEnv();
      expect(config.enabled).toBe(true);

      process.env.CRON_ENABLED = 'TRUE';
      config = getCronConfigFromEnv();
      expect(config.enabled).toBe(true);

      process.env.CRON_ENABLED = 'false';
      config = getCronConfigFromEnv();
      expect(config.enabled).toBe(false);

      process.env.CRON_ENABLED = '0';
      config = getCronConfigFromEnv();
      expect(config.enabled).toBe(false);
    });
  });
});
