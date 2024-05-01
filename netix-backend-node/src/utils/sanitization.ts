import path from 'path';

export function sanitizeFileName(fileName: string) {
  return fileName.replace(/[\0\/\\:*?"<>|]/g, '_');
}

export function normalizeFileName(fileName: string) {
  return path.normalize(fileName).replace(/^(\.\.(\/|\\|$))+/, '');
}

export function limitFileNameLength(fileName: string, maxLength = 200) {
  return fileName.substring(0, maxLength);
}

export function secureFileName(fileName: string, maxLength = 200) {
  let cleanName = fileName.replace(/[\0\/\\:*?"<>|]/g, '_'); // Remove dangerous chars
  cleanName = path.normalize(cleanName).replace(/^(\.\.(\/|\\|$))+/, ''); // Normalize
  cleanName = cleanName.substring(0, maxLength); // Limit length

  return cleanName;
}
