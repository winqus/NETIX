import { Result } from '../logic/Result';
import { UploadState } from '../states/UploadState';
import Entity from './Entity';
import Metadata from './Metadata';
import Thumbnail from './Thumbnail';
import UniqueEntityID from './UniqueEntityID';
import Video from './Video';

interface UploadProps {
  uploaderID: UniqueEntityID;
  video: Video;
  thumbnail: Thumbnail;
  metadata: Metadata;
  state?: UploadState;
}

export default class Upload extends Entity<UploadProps> {
  get uploaderID(): UniqueEntityID {
    return this.props.uploaderID;
  }

  get state(): UploadState {
    return this.props.state || UploadState.PENDING;
  }

  get ready(): boolean {
    return this.state === UploadState.COMPLETED;
  }

  get video(): Video {
    return this.props.video;
  }

  get thumbnail(): Thumbnail {
    return this.props.thumbnail;
  }

  get metadata(): Metadata {
    return this.props.metadata;
  }

  private constructor(props: UploadProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date) {
    super(props, uuid, createdAt, updatedAt);
  }

  public static create(props: UploadProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date): Result<Upload> {
    if (props.state && Object.values(UploadState).includes(props.state) && props.state === UploadState.COMPLETED) {
      if (!props.video) {
        return Result.fail('Video is required');
      }

      if (!props.thumbnail) {
        return Result.fail('Thumbnail is required');
      }

      if (!props.metadata) {
        return Result.fail('Metadata is required');
      }
    }

    if (props.state == null) {
      props.state = UploadState.PENDING;
    }

    const newVideo = new Upload(props, uuid, createdAt, updatedAt);

    return Result.ok(newVideo);
  }
}
