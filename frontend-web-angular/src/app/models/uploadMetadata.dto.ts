export enum MetadataState {
  PENDING = 'pending',
  READY = 'ready',
  FAILED = 'failed',
}

export default interface MetadataDTO {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  publishDatetime: Date;
  ready: boolean;
  state: MetadataState;
}

export interface UploadMetadataRequestDTO {
  metadata: {
    title: string;
    publishDatetime: Date;
  };
}

export interface UploadMetadataResponseDTO {
  success: boolean;
  message?: string;
  metadata?: MetadataDTO;
}
