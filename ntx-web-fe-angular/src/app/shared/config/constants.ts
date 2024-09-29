export const FieldRestrictions = {
  title: {
    minLength: 1,
    maxLength: 200,
  },
  summary: {
    minLength: 1,
    maxLength: 1000,
  },
  runtimeMinutes: {
    min: 1,
    max: 12000,
    pattern: /^[0-9]+$/,
    patternRrror: 'Runtime has to be integer',
  },
};

export const MediaConstants = {
  image: {
    aspectRatio: 2 / 3,
    formats: ['.png', '.jpg', '.jpeg', '.webp'],
    exportFileExtension: 'webp',
    exportMimeType: 'image/webp',
    maxSizeMb: 0.1,
    maxSizeBytes: 100 * 1024,
    maxHeight: 1920,
  },
  video: {
    formats: ['.mkv'],
    maxSize: 10 * 1024 * 1024 * 1024,
  },
};

export const TimeDelays = {
  posterProcessingDelay: 500,
};
