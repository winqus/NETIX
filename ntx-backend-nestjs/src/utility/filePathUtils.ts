export const normalizeToForwardSlash = (path: string) => path.replace(/\\/g, '/');

export const ensureNoTrailingSlash = (path: string) => path.replace(/((\/)|(\\))$/, '');
