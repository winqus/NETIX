import { Result } from '../logic/Result';
import Entity from './Entity';
import UniqueEntityID from './UniqueEntityID';

interface ThumbnailProps {
  path: string;
  mimeType: string;
}

export default class Thumbnail extends Entity<ThumbnailProps> {
  private constructor(props: ThumbnailProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date) {
    super(props, uuid, createdAt, updatedAt);
  }

  public static create(props: ThumbnailProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date): Result<Thumbnail> {
    if (!props.path) {
      return Result.fail<Thumbnail>('Path is required');
    }

    if (!props.mimeType) {
      return Result.fail<Thumbnail>('MIME type is required');
    }

    const thumbnail = new Thumbnail(props, uuid, createdAt, updatedAt);

    return Result.ok<Thumbnail>(thumbnail);
  }
}
