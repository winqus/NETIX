/**
 * Normalizes an array of numbers between a specified minimum and maximum value.
 * If no minimum and maximum values are provided, it uses the minimum and maximum values from the array.
 *
 * @param array - The array of numbers to be normalized.
 * @param min - The minimum value for normalization (optional).
 * @param max - The maximum value for normalization (optional).
 * @returns The normalized array of numbers.
 */
export const normalize = (array: number[], minMaxNormalization = true, min?: number, max?: number): number[] => {
  if (array.length === 0) {
    return [];
  } else if (array.length === 1) {
    return [1];
  }

  const _min = min || Math.min(...array);
  const _max = max || Math.max(...array);

  if (minMaxNormalization) {
    return array.map((value) => (value - _min) / (_max - _min));
  } else {
    return array.map((value) => value / _max);
  }
};

/**
 * Checks if a given position is within the expected position range.
 * The range is inclusive of both ends.
 *
 * @param position - The position to check.
 * @param expectedPositionRange - The expected position range as an array of two numbers [start, end].
 * @returns A boolean indicating whether the position is within the range.
 */
export const isWithinRange = (position: number, expectedPositionRange: number[]): boolean => {
  return position >= expectedPositionRange[0] && position <= expectedPositionRange[1];
};
