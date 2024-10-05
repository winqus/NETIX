import { nanoid } from 'nanoid';

/**
 * Generates a unique identifier string with optional prefix and postfix.
 *
 * @param {string} [prefix] - Optional prefix to prepend to the generated ID.
 * @param {number} [length=21] - Optional length of the unique part of the ID. Defaults to 21.
 * @param {string} [postfix] - Optional postfix to append to the generated ID.
 * @returns {string} The generated unique identifier.
 *
 * @example
 * // Generates a unique ID with default length
 * generateUniqueID() => 'Uakgb_J5m9g-0JDMbcJqLJ'
 *
 * // Generates a unique ID with a prefix and specific length
 * generateUniqueID('user-', 5) => 'user-XR8_Z'
 */
export function generateUniqueID(prefix?: string, length?: number, postfix?: string) {
  /* 21 is the default length of nanoid, collision probability is similar to UUIDv4 */
  length = length || 21;

  const newUUID = (prefix?.trim() || '') + nanoid(length) + (postfix?.trim() || '');

  return newUUID;
}
