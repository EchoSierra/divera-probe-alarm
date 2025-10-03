# Divera Probe Alarm

A Node.js TypeScript project with ESLint and Jest testing framework.

## Requirements

- Node.js 22+
- npm

## Installation

```bash
npm install
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

## Git Hooks

This project uses Husky for Git hooks:

- **pre-commit**: Runs ESLint to check code quality
- **pre-push**: Runs Jest tests to ensure all tests pass

## Project Structure

```
├── src/              # TypeScript source files
├── tests/            # Jest test files
├── dist/             # Compiled JavaScript output
├── .husky/           # Git hooks configuration
├── .github/          # GitHub configuration
├── package.json      # Project dependencies and scripts
├── tsconfig.json     # TypeScript configuration
├── jest.config.js    # Jest configuration
├── .eslintrc.js      # ESLint configuration
└── .prettierrc       # Prettier configuration
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