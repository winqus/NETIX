import { randomBytes } from 'crypto';
import { promisify } from 'util';

const randomBytesAsync = promisify(randomBytes);

export async function generateRandomFileName() {
  const raw = await randomBytesAsync(16);

  return raw.toString('hex');
}
