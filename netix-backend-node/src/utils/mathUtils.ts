/**
 * Checks if a value is within a specified range.
 * @param value - The value to check.
 * @param min - The minimum value of the range (inclusive).
 * @param max - The maximum value of the range (inclusive).
 * @returns `true` if the value is within the range, `false` otherwise.
 */
export function inRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}
