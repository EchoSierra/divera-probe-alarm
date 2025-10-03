import { config } from 'dotenv';
import { DiveraService } from './services/divera.service';
import { CronService, CronConfig } from './services/cron.service';
import { DiveraAlarmRequest } from './types/divera';

// Load environment variables
config();

export const greeting = (name: string): string => {
  return `Hello, ${name}!`;
};

export const getAlarmConfigFromEnv = (): DiveraAlarmRequest => {
  return {
    title: process.env.ALARM_TITLE || 'Test Alarm from Node.js Service',
    text:
      process.env.ALARM_TEXT ||
      'This is a test alarm created by the Divera Probe Alarm service.',
    priority: process.env.ALARM_PRIORITY
      ? parseInt(process.env.ALARM_PRIORITY, 10)
      : 1,
    foreign_id: `alarm-${Date.now()}`,
    address: process.env.ALARM_ADDRESS || 'Test Address, Test City',
    announcement: false,
  };
};

export const createDiveraAlarm = async (
  alarmData: DiveraAlarmRequest
): Promise<void> => {
  try {
    const diveraService = new DiveraService();
    console.log(`Using API key: ${diveraService.getApiKey()}`);

    const response = await diveraService.createAlarm(alarmData);

    if (response.success) {
      console.log('✅ Alarm created successfully!');
      console.log(`Alarm ID: ${response.alarm?.id}`);
      console.log(`Title: ${response.alarm?.title}`);
      console.log(`Created: ${response.alarm?.created}`);
    } else {
      console.error('❌ Failed to create alarm:', response.error);
    }
  } catch (error) {
    console.error('❌ Error creating alarm:', error);
  }
};

export const getCronConfigFromEnv = (): CronConfig => {
  return {
    pattern: process.env.CRON_PATTERN || '40 11 * * 6', // Default: Saturday at 11:40 AM
    timezone: process.env.CRON_TIMEZONE || 'Europe/Berlin',
    enabled:
      process.env.CRON_ENABLED?.toLowerCase() === 'true' ||
      process.env.CRON_ENABLED === '1',
  };
};

export const main = async (): Promise<void> => {
  console.log(greeting('Divera Probe Alarm Service'));

  const cronConfig = getCronConfigFromEnv();

  if (cronConfig.enabled) {
    console.log('\n⏰ Cron mode enabled - starting scheduled alarms');
    console.log(`📅 Schedule: ${cronConfig.pattern}`);
    console.log(`🌍 Timezone: ${cronConfig.timezone}`);

    try {
      const cronService = new CronService(cronConfig);
      cronService.start();

      console.log('✅ Cron service started successfully');
      console.log('🔄 Service will keep running for scheduled alarms...');
      console.log('💡 Press Ctrl+C to stop\n');

      // Keep the process alive
      process.on('SIGINT', () => {
        console.log('\n🛑 Received interrupt signal, stopping cron service...');
        cronService.stop();
        cronService.destroy();
        console.log('👋 Service stopped. Goodbye!');
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ Failed to start cron service:', error);
      process.exit(1);
    }
  } else {
    console.log('\n🚨 One-time alarm mode (cron disabled)');

    // Load alarm configuration from environment variables
    const alarmData = getAlarmConfigFromEnv();

    console.log('\n� Creating alarm with configuration:');
    console.log(`  Title: ${alarmData.title}`);
    console.log(`  Text: ${alarmData.text}`);
    console.log(`  Priority: ${alarmData.priority}`);
    console.log(`  Address: ${alarmData.address}`);
    console.log(`  Foreign ID: ${alarmData.foreign_id}`);

    await createDiveraAlarm(alarmData);
  }
};

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
