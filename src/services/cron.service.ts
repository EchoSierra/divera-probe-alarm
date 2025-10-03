import * as cron from 'node-cron';
import moment from 'moment-timezone';
import { DiveraService } from './divera.service';
import { DiveraAlarmRequest } from '../types/divera';

export interface CronConfig {
  pattern: string;
  timezone: string;
  enabled: boolean;
}

export class CronService {
  private cronJob?: cron.ScheduledTask;
  private diveraService: DiveraService;
  private config: CronConfig;

  constructor(cronConfig: CronConfig, diveraService?: DiveraService) {
    this.config = cronConfig;
    this.diveraService = diveraService || new DiveraService();
  }

  /**
   * Starts the cron job
   */
  start(): void {
    if (!this.config.enabled) {
      console.log('⏰ Cron job is disabled via configuration');
      return;
    }

    if (!cron.validate(this.config.pattern)) {
      throw new Error(`Invalid cron pattern: ${this.config.pattern}`);
    }

    console.log(`⏰ Starting cron job with pattern: ${this.config.pattern}`);
    console.log(`⏰ Timezone: ${this.config.timezone}`);

    this.cronJob = cron.schedule(
      this.config.pattern,
      async () => {
        await this.executeScheduledAlarm();
      },
      {
        timezone: this.config.timezone,
      }
    );

    this.cronJob.start();
    console.log('⏰ Cron job started successfully');
  }

  /**
   * Stops the cron job
   */
  stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('⏰ Cron job stopped');
    }
  }

  /**
   * Destroys the cron job
   */
  destroy(): void {
    if (this.cronJob) {
      this.cronJob.destroy();
      console.log('⏰ Cron job destroyed');
    }
  }

  /**
   * Gets the current cron pattern and timezone info
   */
  getStatus(): string {
    if (!this.cronJob) {
      return 'Job not started';
    }

    const now = moment().tz(this.config.timezone);
    return `Cron job running with pattern: ${this.config.pattern} in timezone ${this.config.timezone} (current time: ${now.format('YYYY-MM-DD HH:mm:ss z')})`;
  }

  /**
   * Checks if the cron job is running
   */
  isRunning(): boolean {
    return this.cronJob !== undefined;
  }

  /**
   * Gets the current configuration
   */
  getConfig(): CronConfig {
    return { ...this.config };
  }

  /**
   * Executes the scheduled alarm
   */
  private async executeScheduledAlarm(): Promise<void> {
    const currentTime = moment().tz(this.config.timezone);
    console.log(
      `\n🚨 Executing scheduled alarm at ${currentTime.format('YYYY-MM-DD HH:mm:ss z')}`
    );

    try {
      const alarmData = this.createScheduledAlarmData();

      console.log('📋 Scheduled alarm configuration:');
      console.log(`  Title: ${alarmData.title}`);
      console.log(`  Text: ${alarmData.text}`);
      console.log(`  Priority: ${alarmData.priority}`);
      console.log(`  Address: ${alarmData.address}`);

      const response = await this.diveraService.createAlarm(alarmData);

      if (response.success) {
        console.log('✅ Scheduled alarm created successfully!');
        console.log(`📧 Alarm ID: ${response.alarm?.id}`);
        console.log(`📅 Created: ${response.alarm?.created}`);
      } else {
        console.error('❌ Failed to create scheduled alarm:', response.error);
      }
    } catch (error) {
      console.error('❌ Error executing scheduled alarm:', error);
    }

    console.log('⏰ Scheduled alarm execution completed\n');
  }

  /**
   * Creates alarm data for scheduled execution
   */
  private createScheduledAlarmData(): DiveraAlarmRequest {
    const currentTime = moment().tz(this.config.timezone);

    return {
      title:
        process.env.ALARM_TITLE || 'Geplanter Alarm vom Divera Probe Service',
      text:
        process.env.ALARM_TEXT ||
        `Geplanter Alarm ausgelöst am ${currentTime.format('DD.MM.YYYY um HH:mm')} Uhr.`,
      priority: process.env.ALARM_PRIORITY
        ? parseInt(process.env.ALARM_PRIORITY, 10)
        : 1,
      foreign_id: `scheduled-alarm-${currentTime.format('YYYY-MM-DD-HH-mm-ss')}`,
      address: process.env.ALARM_ADDRESS || 'Testadresse, Deutschland',
      announcement: false,
    };
  }
}

export default CronService;
