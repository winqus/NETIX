import { Result } from '../logic/Result';
import { VideoState } from '../states/VideoState';
import Entity from './Entity';
import UniqueEntityID from './UniqueEntityID';

interface VideoProps {
  lengthInSeconds?: number;
  sizeInBytes?: number;
  state?: VideoState;
}

export default class Video extends Entity<VideoProps> {
  get state(): VideoState {
    return this.props.state || VideoState.PENDING;
  }

  get ready(): boolean {
    return this.state === VideoState.READY;
  }

  get lengthInSeconds(): number {
    if (!this.ready) {
      throw new Error('Cannot access length of a video that is not ready');
    }

    return this.props.lengthInSeconds || 0;
  }

  get sizeInBytes(): number {
    if (!this.ready) {
      throw new Error('Cannot access size of a video that is not ready');
    }

    return this.props.sizeInBytes || 0;
  }

  private constructor(props: VideoProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date) {
    super(props, uuid, createdAt, updatedAt);
  }

  public static create(props: VideoProps, uuid?: UniqueEntityID, createdAt?: Date, updatedAt?: Date): Result<Video> {
    if (props.state && Object.values(VideoState).includes(props.state) && props.state === VideoState.READY) {
      if (!props.lengthInSeconds) {
        return Result.fail('Length is required');
      }

      if (!props.sizeInBytes) {
        return Result.fail('Size is required');
      }
    }

    if (props.state == null) {
      props.state = VideoState.PENDING;
    }

    const newVideo = new Video(props, uuid, createdAt, updatedAt);

    return Result.ok(newVideo);
  }
}
