export const greeting = (name: string): string => {
  return `Hello, ${name}!`;
};

export const main = (): void => {
  console.log(greeting('World'));
};

if (require.main === module) {
  main();
}
