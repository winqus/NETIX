export function encodeStateToBase64<T>(state: T): string {
  const encodedString = btoa(JSON.stringify(state));
  return encodedString;
}

export function decodeStateFromURIandBase64<T>(encodedState: string): T {
  const urlDecodedString = decodeURIComponent(encodedState);
  const decodedObj = JSON.parse(atob(urlDecodedString)) as T;
  return decodedObj;
}
