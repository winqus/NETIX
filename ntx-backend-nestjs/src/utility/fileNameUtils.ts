/**
 * Generates a temporary file name based on the provided options.
 * Format: {prefix}-{timestamp}.{ext}
 * @param options - The options for generating the temporary file name.
 * @param options.prefix - The prefix to be added to the file name (optional).
 * @param options.ext - The file extension to be added to the file name (optional).
 * Ignores the leading dot in the extension if present (e.g. '.png' will be treated as 'png').
 * @returns The generated temporary file name.
 * @example generateTempFileName({ prefix: 'video', ext: 'mkv' });
 * // Potential result: 'video-20240915-133543-919Z.mkv'
 * @example generateTempFileName();
 * // Potential result: '20240915-133543-919Z'
 * @example generateTempFileName({ ext: '.png' });
 * // Potential result: '20240915-133543-919Z.png'
 */
export const generateTempFileName = (options: { prefix?: string; ext?: string }) => {
  const prefix: string = options.prefix || '';
  const ext: string = options.ext || '';

  let fileName = new Date().toISOString().replace(/[-:]/g, '').replace(/[T\.]/g, '-');

  if (prefix.length > 0) {
    fileName = prefix + '-' + fileName;
  }

  if (ext.length > 0) {
    fileName = fileName + '.' + ext.replace(/^\./, '');
  }

  return fileName;
};
