import UploadDTO from './UploadDTO';

export default interface FullUploadVideoJobDTO {
  uuid: string;
  createdAt: Date;
  updatedAt: Date;
  upload: UploadDTO;
  chunks: boolean[];
  chunksReceived: number;
  totalChunkCount: number;
  rawFileSizeInBytes: number;
  originalFileName: string;
  uploadFileProgressPercentage: number;
  uploadFileDone: boolean;
  transcodingProgressPercentage: number;
  transcodingDone: boolean;
  transcodingRate: number;
}
