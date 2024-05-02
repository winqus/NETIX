export interface VideoConfig {
  titleLength: { min: number; max: number };
  descriptionLength: { min: number; max: number };
  tagValueLength: { min: number; max: number };
  tagCount: { min: number; max: number };
  durationInSeconds: { min: number; max: number };
  sizeInBytes: { min: number; max: number };
  allowedMimeTypes: string[];
  resolution: {
    minWidth: number;
    minHeight: number;
    maxWidth: number;
    maxHeight: number;
  };
  thumbnail: {
    rawUploadDir: string;
    processedUploadDir: string;
    maxSizeBytes: number;
    allowedMimeTypes: string[];
    resolution: {
      minWidth: number;
      minHeight: number;
      maxWidth: number;
      maxHeight: number;
    };
    aspectRatio: {
      width: number;
      height: number;
    };
  };
  rawUploadDir: string;
  processedUploadDir: string;
  singleChunkMaxSizeInBytes: number;
  defaultUserUploadRateInChunksAtOnce: number;
}

const videoConfig: VideoConfig = {
  titleLength: { min: 1, max: 100 },
  descriptionLength: { min: 0, max: 1000 },
  tagValueLength: { min: 3, max: 20 },
  tagCount: { min: 1, max: 20 },
  durationInSeconds: { min: 1, max: 10 * 3600 }, // Max 10 hours
  sizeInBytes: { min: 1, max: 20 * 1073741824 }, // 20 GB
  allowedMimeTypes: ['video/mp4', 'video/x-matroska'],
  resolution: {
    minWidth: 640,
    minHeight: 360,
    maxWidth: 1920,
    maxHeight: 1080,
  },
  thumbnail: {
    rawUploadDir: `${process.env.RAW_THUMBNAIL_UPLOAD_DIR || './data/uploads/rawThumbnails'}`,
    processedUploadDir: `${process.env.PROCESSED_THUMBNAIL_UPLOAD_DIR || './data/uploads/processedThumbnails'}`,
    maxSizeBytes: 1000 * 1024, // 1000 KB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    resolution: {
      minWidth: 100,
      minHeight: 100,
      maxWidth: 1920,
      maxHeight: 1080,
    },
    aspectRatio: {
      width: 12,
      height: 17,
    },
  },
  rawUploadDir: `${process.env.RAW_VIDEO_UPLOAD_DIR || './data/uploads/rawVideos'}`,
  processedUploadDir: `${process.env.PROCESSED_VIDEO_UPLOAD_DIR || './data/uploads/processedVideos'}`,
  singleChunkMaxSizeInBytes: 150 * 1024 * 1024, // 150 MB
  defaultUserUploadRateInChunksAtOnce: 1,
};

export default videoConfig;
