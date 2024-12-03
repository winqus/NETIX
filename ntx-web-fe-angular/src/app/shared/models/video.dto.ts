export interface VideoRequirementDTO {
  supportedMimeTypes: string[];
  allowedExtensions: string[];
  maxFileSizeInBytes: number;
}

export interface VideoDTO {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  name: string;
  state: VideoState;
}

export enum VideoState {
  NOT_READY = 'NOT_READY',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}
