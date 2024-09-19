import * as crypto from 'crypto';

export function generateHash(...args: string[]) {
  const dataToHash = args.join('|');

  return crypto.createHash('sha256').update(dataToHash).digest('base64');
}
