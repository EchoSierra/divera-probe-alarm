# Divera Probe Alarm

A Node.js TypeScript service for creating alarms via the Divera247 API. Built with ESLint and Jest testing framework.

## Features

- **Divera247 API Integration**: Create alarms through the Divera247 service API
- **Environment Configuration**: Secure API key management via environment variables
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Robust error handling with detailed error messages
- **Unit Testing**: Comprehensive test coverage with Jest
- **Code Quality**: ESLint and Prettier for code linting and formatting

## Requirements

- Node.js 22+
- npm
- Divera247 API account with valid API key

## Installation

```bash
npm install
```

## Configuration

1. Copy the environment example file:

```bash
cp .env.example .env
```

2. Edit `.env` and configure your settings:

```bash
# Required: Your Divera247 API key
DIVERA_WEB_API_KEY=your_actual_api_key_here

# Optional: API base URL (defaults to https://api.divera247.com/api/v1)
DIVERA_API_BASE_URL=https://api.divera247.com/api/v1

# Optional: Alarm configuration
ALARM_TITLE=Test Alarm vom Divera Probe Service
ALARM_TEXT=Dies ist ein Testalarm, der vom Divera Probe Alarm Service generiert wurde.
ALARM_PRIORITY=1
ALARM_ADDRESS=Testadresse, Teststadt

# Optional: Cron/Scheduler configuration
CRON_ENABLED=false
CRON_PATTERN=40 11 * * 6
CRON_TIMEZONE=Europe/Berlin
```

## Development

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Development Server

Start the development server with hot reloading:

```bash
npm run dev
```

### Production

Start the compiled application:

```bash
npm start
```

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

## Linting

Check linting:

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint:fix
```

## Code Formatting

Format all files with Prettier:

```bash
npm run format
```

Check if files are properly formatted:

```bash
npm run format:check
```

## Git Hooks

This project uses Husky for Git hooks:

- **pre-commit**: Checks code formatting with Prettier and runs ESLint to ensure code quality
- **pre-push**: Runs Jest tests to ensure all tests pass

## VS Code Setup

This project includes VS Code configuration files to ensure consistent formatting:

1. **Install recommended extensions**: VS Code will prompt you to install the recommended extensions when you open the project
2. **Automatic formatting**: Files will be automatically formatted with Prettier on save
3. **ESLint integration**: ESLint errors and warnings will be shown inline

### Manual Setup (if needed)

If VS Code doesn't automatically use the correct formatter:

1. Install the Prettier extension: `esbenp.prettier-vscode`
2. Install the ESLint extension: `dbaeumer.vscode-eslint`
3. Set Prettier as the default formatter in VS Code settings
4. Enable "Format on Save" in VS Code settings

## Usage

### Basic Example

```typescript
import { DiveraService } from './services/divera.service';
import { DiveraAlarmRequest } from './types/divera';

const diveraService = new DiveraService();

const alarmData: DiveraAlarmRequest = {
  title: 'Fire Alarm',
  text: 'Emergency at Building A',
  priority: 1,
  address: '123 Main Street, City',
  foreign_id: 'alarm-001',
};

try {
  const response = await diveraService.createAlarm(alarmData);
  console.log('Alarm created:', response.alarm?.id);
} catch (error) {
  console.error('Failed to create alarm:', error);
}
```

### Command Line Usage

Run the example application:

```bash
npm run dev
```

This will create a test alarm using the configured API key.

### Scheduled Alarms (Cron Mode)

Enable scheduled alarms by setting `CRON_ENABLED=true`:

```bash
# Enable cron mode
CRON_ENABLED=true

# Run every Saturday at 11:40 AM German time (default)
CRON_PATTERN=40 11 * * 6

# Set timezone (handles daylight saving time automatically)
CRON_TIMEZONE=Europe/Berlin

npm run dev
```

The service will keep running and execute alarms according to the cron pattern.

#### Cron Pattern Examples

- `40 11 * * 6` - Every Saturday at 11:40 AM
- `0 9 * * 1-5` - Every weekday at 9:00 AM
- `*/30 * * * *` - Every 30 minutes
- `0 8,12,18 * * *` - At 8:00, 12:00, and 18:00 daily
- `0 0 1 * *` - First day of every month at midnight

#### Timezone Support

The service supports all timezone identifiers from the IANA timezone database, with automatic handling of daylight saving time transitions:

- `Europe/Berlin` - German time (CET/CEST)
- `Europe/London` - British time (GMT/BST)
- `America/New_York` - Eastern time (EST/EDT)
- `Asia/Tokyo` - Japan time (JST)

## API Reference

### DiveraService

#### Constructor

```typescript
new DiveraService(apiKey?: string, baseURL?: string)
```

- `apiKey`: Optional API key. If not provided, reads from `DIVERA_WEB_API_KEY` environment variable
- `baseURL`: Optional API base URL. Defaults to `https://api.divera247.com/api/v1`

#### Methods

##### `createAlarm(alarmData: DiveraAlarmRequest): Promise<DiveraAlarmResponse>`

Creates a new alarm in Divera247.

##### `validateApiKey(): Promise<boolean>`

Validates the configured API key.

##### `getApiKey(): string`

Returns a masked version of the API key for debugging purposes.

### Types

#### DiveraAlarmRequest

```typescript
interface DiveraAlarmRequest {
  title: string; // Required: Alarm title
  text?: string; // Optional: Alarm description
  priority?: number; // Optional: Priority level (1-5)
  group?: number[]; // Optional: Group IDs to notify
  vehicle?: number[]; // Optional: Vehicle IDs to dispatch
  foreign_id?: string; // Optional: External reference ID
  address?: string; // Optional: Incident address
  lat?: number; // Optional: Latitude
  lng?: number; // Optional: Longitude
  alarm_date?: string; // Optional: Alarm date/time (ISO format)
  alarm_end?: string; // Optional: Alarm end date/time (ISO format)
  ric?: string; // Optional: RIC code
  keyword?: string; // Optional: Alarm keyword
  announcement?: boolean; // Optional: Whether this is an announcement
}
```

## Project Structure

```
├── src/                  # TypeScript source files
│   ├── services/         # Service layer (API clients)
│   ├── types/           # TypeScript type definitions
│   └── index.ts         # Main application entry point
├── tests/               # Jest test files
├── dist/                # Compiled JavaScript output
├── .husky/              # Git hooks configuration
├── .github/             # GitHub configuration
├── .env.example         # Environment variables template
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── jest.config.js       # Jest configuration
├── .eslintrc.js         # ESLint configuration
└── .prettierrc          # Prettier configuration
```

## Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Start development server with hot reloading
- `npm start` - Start the compiled application
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Check code linting
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format all files with Prettier
- `npm run format:check` - Check if files are properly formatted
