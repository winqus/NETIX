import { Result } from '../logic/Result';
import Entity from './Entity';
import UniqueEntityID from './UniqueEntityID';

interface VideoMetadataProps {
  mimeType: string;
  title: string;
  description: string;
  durationInSeconds: number;
  sizeInBytes: number;
  originallyPublishedAt: Date;
}

export default class VideoMetadata extends Entity<VideoMetadataProps> {
  private constructor(props: VideoMetadataProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date) {
    super(props, uuid, createdAt, updatedAt);
  }

  public static create(props: VideoMetadataProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date): Result<VideoMetadata> {
    if (!props.durationInSeconds) {
      return Result.fail<VideoMetadata>('Duration in seconds is required');
    }

    if (props.durationInSeconds <= 0) {
      return Result.fail<VideoMetadata>('Duration in seconds must be greater than 0');
    }

    if (!props.mimeType) {
      return Result.fail<VideoMetadata>('Format is required');
    }

    const thumbnail = new VideoMetadata(props, uuid, createdAt, updatedAt);

    return Result.ok<VideoMetadata>(thumbnail);
  }
}
