import { config } from 'dotenv';
import { DiveraService } from './services/divera.service';
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

export const main = async (): Promise<void> => {
  console.log(greeting('Divera Probe Alarm Service'));

  // Load alarm configuration from environment variables
  const alarmData = getAlarmConfigFromEnv();

  console.log('\n🚨 Creating alarm with configuration:');
  console.log(`  Title: ${alarmData.title}`);
  console.log(`  Text: ${alarmData.text}`);
  console.log(`  Priority: ${alarmData.priority}`);
  console.log(`  Address: ${alarmData.address}`);
  console.log(`  Foreign ID: ${alarmData.foreign_id}`);

  await createDiveraAlarm(alarmData);
};

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
