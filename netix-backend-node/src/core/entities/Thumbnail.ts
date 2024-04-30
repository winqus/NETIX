import { Result } from '../logic/Result';
import { ThumbnailState } from '../states/ThumbnailState';
import Entity from './Entity';
import UniqueEntityID from './UniqueEntityID';

interface ThumbnailProps {
  mimeType?: string;
  state?: ThumbnailState;
}

export default class Thumbnail extends Entity<ThumbnailProps> {
  get state(): ThumbnailState {
    return this.props.state || ThumbnailState.PENDING;
  }

  get ready(): boolean {
    return this.state === ThumbnailState.READY;
  }

  get mimeType(): string {
    if (!this.ready) {
      throw new Error('Cannot access MIME type of a thumbnail that is not ready');
    }

    return this.props.mimeType || 'No MIME type';
  }

  private constructor(props: ThumbnailProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date) {
    super(props, uuid, createdAt, updatedAt);
  }

  public static create(props: ThumbnailProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date): Result<Thumbnail> {
    if (props.state && Object.values(ThumbnailState).includes(props.state) && props.state === ThumbnailState.READY) {
      if (!props.mimeType) {
        return Result.fail('MIME type is required');
      }
    }

    if (props.state == null) {
      props.state = ThumbnailState.PENDING;
    }

    const thumbnail = new Thumbnail(props, uuid, createdAt, updatedAt);

    return Result.ok(thumbnail);
  }
}
