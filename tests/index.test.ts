import { greeting } from '../src/index';

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
