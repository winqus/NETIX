export const makeCaseInsensitiveRegex = (pattern: string): RegExp => {
  return new RegExp(pattern, 'i');
};
