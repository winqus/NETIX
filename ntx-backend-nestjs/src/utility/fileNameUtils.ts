/**
 * Generates a temporary file name based on the provided options.
 * Format: {prefix}-{timestamp}-{randomNumber}.{ext}
 * @param options - The options for generating the temporary file name.
 * @param options.prefix - The prefix to be added to the file name (optional).
 * @param options.ext - The file extension to be added to the file name (optional).
 * Ignores the leading dot in the extension if present (e.g. '.png' will be treated as 'png').
 * @returns The generated temporary file name.
 * @example generateTempFileName({ prefix: 'video', ext: 'mkv' });
 * // Potential result: 'video-1721581214261-232756333.mkv'
 * @example generateTempFileName();
 * // Potential result: '2221581214222-131756311'
 * @example generateTempFileName({ ext: '.png' });
 * // Potential result: '2221581214222-131756311.png'
 */
export const generateTempFileName = (options: { prefix?: string; ext?: string }) => {
  const prefix: string = options.prefix || '';
  const ext: string = options.ext || '';

  let fileName = Date.now() + '-' + Math.round(Math.random() * 1e9);

  if (prefix.length > 0) {
    fileName = prefix + '-' + fileName;
  }

  if (ext.length > 0) {
    fileName = fileName + '.' + ext.replace(/^\./, '');
  }

  return fileName;
};
