# Project Instructions

This is a Node.js TypeScript project with ESLint and Jest testing framework.

## Development Workflow
- ESLint checks are enforced before commits using Git hooks
- Tests are run before pushes using Git hooks
- Use `npm run dev` to start development server
- Use `npm run build` to compile TypeScript to JavaScript
- Use `npm test` to run Jest tests
- Use `npm run lint` to check linting
- Use `npm run lint:fix` to auto-fix linting issues

## Project Structure
- `src/` - TypeScript source files
- `dist/` - Compiled JavaScript output
- `tests/` - Jest test files
- `.husky/` - Git hooks configuration

## Requirements
- Node.js 22+
- TypeScript
- ESLint for code linting
- Jest for testing
- Husky for Git hooks