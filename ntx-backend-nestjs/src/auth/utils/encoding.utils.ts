/**
 * @param state A base64 encoded JSON string
 * @returns Object
 */
export function decodeBase64StringToObject(state: string): unknown {
  return JSON.parse(Buffer.from(state, 'base64').toString());
}
