/**
 * @example
 * ```typescript
 * ensureDotPrefix('example'); // returns '.example'
 * ensureDotPrefix('.example'); // returns '.example'
 * ensureDotPrefix('..example'); // returns '.example'
 * ```
 */
export function ensureSingleDotPrefix(str: string): string {
  const trimmedStr = str.replace(/^\.*/, '');

  return `.${trimmedStr}`;
}
