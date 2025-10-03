import { config } from 'dotenv';
import { DiveraService } from './services/divera.service';
import { DiveraAlarmRequest } from './types/divera';

// Load environment variables
config();

export const greeting = (name: string): string => {
  return `Hello, ${name}!`;
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

  // Example alarm data
  const exampleAlarm: DiveraAlarmRequest = {
    title: 'Test Alarm from Node.js Service',
    text: 'This is a test alarm created by the Divera Probe Alarm service.',
    priority: 1,
    foreign_id: `test-${Date.now()}`,
    address: 'Test Address, Test City',
    announcement: false,
  };

  console.log('\n🚨 Creating test alarm...');
  await createDiveraAlarm(exampleAlarm);
};

if (require.main === module) {
  main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
