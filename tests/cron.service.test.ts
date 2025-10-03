import { CronService, CronConfig } from '../src/services/cron.service';
import { DiveraService } from '../src/services/divera.service';

// Mock node-cron
jest.mock('node-cron', () => ({
  validate: jest.fn(),
  schedule: jest.fn(),
}));

// Mock moment-timezone
jest.mock('moment-timezone', () => {
  const mockMoment = {
    tz: jest.fn().mockReturnThis(),
    format: jest.fn().mockReturnValue('2023-10-03 12:00:00 CEST'),
  };

  const moment: any = jest.fn(() => mockMoment);
  moment.tz = jest.fn(() => mockMoment);

  return moment;
}); // Mock DiveraService
jest.mock('../src/services/divera.service');

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(),
  error: jest.spyOn(console, 'error').mockImplementation(),
};

describe('CronService', () => {
  let cronService: CronService;
  let mockDiveraService: jest.Mocked<DiveraService>;
  let mockCron: any;
  let mockMoment: any;

  const defaultConfig: CronConfig = {
    pattern: '0 9 * * 1',
    timezone: 'Europe/Berlin',
    enabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup cron mock
    mockCron = require('node-cron');
    mockCron.validate.mockReturnValue(true);

    const mockCronJob = {
      start: jest.fn(),
      stop: jest.fn(),
      destroy: jest.fn(),
    };
    mockCron.schedule.mockReturnValue(mockCronJob);

    // Setup moment mock
    mockMoment = require('moment-timezone');
    const mockMomentInstance = {
      tz: jest.fn().mockReturnThis(),
      format: jest.fn().mockReturnValue('2023-10-03 12:00:00 CEST'),
    };
    mockMoment.mockReturnValue(mockMomentInstance);
    mockMoment.tz.mockReturnValue(mockMomentInstance);

    // Setup DiveraService mock
    mockDiveraService = {
      createAlarm: jest.fn(),
      getApiKey: jest.fn().mockReturnValue('test...key'),
      validateApiKey: jest.fn(),
    } as any;

    cronService = new CronService(defaultConfig, mockDiveraService);
  });

  afterAll(() => {
    consoleSpy.log.mockRestore();
    consoleSpy.error.mockRestore();
  });

  describe('constructor', () => {
    it('should create instance with provided config', () => {
      const config = cronService.getConfig();
      expect(config).toEqual(defaultConfig);
    });

    it('should create DiveraService if not provided', () => {
      const service = new CronService(defaultConfig);
      expect(service).toBeInstanceOf(CronService);
    });
  });

  describe('start', () => {
    it('should not start if cron is disabled', () => {
      const disabledConfig = { ...defaultConfig, enabled: false };
      const service = new CronService(disabledConfig);

      service.start();

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '⏰ Cron job is disabled via configuration'
      );
      expect(mockCron.schedule).not.toHaveBeenCalled();
    });

    it('should throw error for invalid cron pattern', () => {
      mockCron.validate.mockReturnValue(false);

      expect(() => cronService.start()).toThrow(
        'Invalid cron pattern: 0 9 * * 1'
      );
    });

    it('should start cron job with valid configuration', () => {
      cronService.start();

      expect(mockCron.validate).toHaveBeenCalledWith('0 9 * * 1');
      expect(mockCron.schedule).toHaveBeenCalledWith(
        '0 9 * * 1',
        expect.any(Function),
        { timezone: 'Europe/Berlin' }
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '⏰ Starting cron job with pattern: 0 9 * * 1'
      );
      expect(consoleSpy.log).toHaveBeenCalledWith('⏰ Timezone: Europe/Berlin');
    });
  });

  describe('stop', () => {
    it('should stop cron job if running', () => {
      cronService.start();
      const mockCronJob = mockCron.schedule.mock.results[0].value;

      cronService.stop();

      expect(mockCronJob.stop).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith('⏰ Cron job stopped');
    });

    it('should do nothing if no cron job exists', () => {
      cronService.stop();
      // Should not throw and should not call any mock methods
    });
  });

  describe('destroy', () => {
    it('should destroy cron job if running', () => {
      cronService.start();
      const mockCronJob = mockCron.schedule.mock.results[0].value;

      cronService.destroy();

      expect(mockCronJob.destroy).toHaveBeenCalled();
      expect(consoleSpy.log).toHaveBeenCalledWith('⏰ Cron job destroyed');
    });
  });

  describe('getStatus', () => {
    it('should return not started message if job not started', () => {
      const status = cronService.getStatus();
      expect(status).toBe('Job not started');
    });

    it('should return status information if job is running', () => {
      cronService.start();
      const status = cronService.getStatus();
      expect(status).toContain('Cron job running with pattern: 0 9 * * 1');
      expect(status).toContain('Europe/Berlin');
    });
  });

  describe('isRunning', () => {
    it('should return false if not started', () => {
      expect(cronService.isRunning()).toBe(false);
    });

    it('should return true if started', () => {
      cronService.start();
      expect(cronService.isRunning()).toBe(true);
    });
  });

  describe('scheduled execution', () => {
    beforeEach(() => {
      // Setup environment variables
      process.env.ALARM_TITLE = 'Test Scheduled Alarm';
      process.env.ALARM_TEXT = 'Test scheduled alarm text';
      process.env.ALARM_PRIORITY = '2';
      process.env.ALARM_ADDRESS = 'Test Address';
    });

    it('should execute scheduled alarm successfully', async () => {
      const mockResponse = {
        success: true,
        alarm: {
          id: 12345,
          title: 'Test Scheduled Alarm',
          created: '2023-10-03T12:00:00Z',
        },
      };

      mockDiveraService.createAlarm.mockResolvedValue(mockResponse);

      cronService.start();

      // Get the scheduled function and execute it
      const scheduledFunction = mockCron.schedule.mock.calls[0][1];
      await scheduledFunction();

      expect(mockDiveraService.createAlarm).toHaveBeenCalledWith({
        title: 'Test Scheduled Alarm',
        text: 'Test scheduled alarm text',
        priority: 2,
        foreign_id: expect.stringContaining('scheduled-alarm-'),
        address: 'Test Address',
        announcement: false,
      });

      expect(consoleSpy.log).toHaveBeenCalledWith(
        '✅ Scheduled alarm created successfully!'
      );
    });

    it('should handle failed alarm creation', async () => {
      const mockResponse = {
        success: false,
        error: 'API Error',
      };

      mockDiveraService.createAlarm.mockResolvedValue(mockResponse);

      cronService.start();

      const scheduledFunction = mockCron.schedule.mock.calls[0][1];
      await scheduledFunction();

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ Failed to create scheduled alarm:',
        'API Error'
      );
    });

    it('should handle service errors', async () => {
      const mockError = new Error('Network error');
      mockDiveraService.createAlarm.mockRejectedValue(mockError);

      cronService.start();

      const scheduledFunction = mockCron.schedule.mock.calls[0][1];
      await scheduledFunction();

      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ Error executing scheduled alarm:',
        mockError
      );
    });
  });
});
