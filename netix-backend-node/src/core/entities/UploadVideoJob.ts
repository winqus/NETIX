import { Result } from '../logic/Result';
import Entity from './Entity';
import UniqueEntityID from './UniqueEntityID';

interface UploadVideoJobProps {
  uploadID: UniqueEntityID;
  chunks?: boolean[];
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

export default class UploadVideoJob extends Entity<UploadVideoJobProps> {
  get uploadID(): UniqueEntityID {
    return this.props.uploadID;
  }

  get chunks(): boolean[] {
    return this.props.chunks!;
  }

  get chunksReceived(): number {
    return this.props.chunksReceived;
  }

  get chunksRemaining(): number {
    return this.totalChunkCount - this.chunksReceived;
  }

  get totalChunkCount(): number {
    return this.props.totalChunkCount;
  }

  get rawFileSizeInBytes(): number {
    return this.props.rawFileSizeInBytes;
  }

  get originalFileName(): string {
    return this.props.originalFileName;
  }

  get uploadFileProgressPercentage(): number {
    return this.props.uploadFileProgressPercentage;
  }

  get uploadFileDone(): boolean {
    return this.props.uploadFileDone;
  }

  get transcodingProgressPercentage(): number {
    return this.props.transcodingProgressPercentage;
  }

  get transcodingDone(): boolean {
    return this.props.transcodingDone;
  }

  get transcodingRate(): number {
    return this.props.transcodingRate;
  }

  private constructor(props: UploadVideoJobProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date) {
    super(props, uuid, createdAt, updatedAt);
  }

  public static create(props: UploadVideoJobProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date): Result<UploadVideoJob> {
    if (!props.uploadID) {
      return Result.fail('Upload ID is required');
    }

    if (props.chunks == null) {
      props.chunks = Array.from({ length: props.totalChunkCount }, () => false);
    }

    if (props.chunksReceived == null || props.chunksReceived < 0 || !Number.isInteger(props.chunksReceived)) {
      return Result.fail('Valid chunks received is required');
    }

    if (props.chunksReceived > props.totalChunkCount) {
      return Result.fail('Chunks received cannot be greater than total chunk count');
    }

    if (props.totalChunkCount == null || props.totalChunkCount < 0 || !Number.isInteger(props.totalChunkCount)) {
      return Result.fail('Valid total chunk count is required');
    }

    if (props.rawFileSizeInBytes == null || props.rawFileSizeInBytes < 0 || !Number.isInteger(props.rawFileSizeInBytes)) {
      return Result.fail('Valid raw file size is required');
    }

    if (props.originalFileName == null) {
      return Result.fail('Original file name is required');
    }

    if (props.uploadFileProgressPercentage == null || props.uploadFileProgressPercentage < 0 || props.uploadFileProgressPercentage > 100) {
      return Result.fail('Valid upload file progress percentage is required');
    }

    if (props.uploadFileDone == null) {
      return Result.fail('Upload file done is required');
    }

    if (props.transcodingProgressPercentage == null || props.transcodingProgressPercentage < 0 || props.transcodingProgressPercentage > 100) {
      return Result.fail('Transcoding progress percentage is required');
    }

    if (props.transcodingDone == null) {
      return Result.fail('Transcoding done is required');
    }

    if (props.transcodingRate == null) {
      return Result.fail('Transcoding rate is required');
    }

    const newVideo = new UploadVideoJob(props, uuid, createdAt, updatedAt);

    return Result.ok(newVideo);
  }
}
