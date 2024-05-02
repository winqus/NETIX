import MetadataDTO from './MetadataDTO';

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
