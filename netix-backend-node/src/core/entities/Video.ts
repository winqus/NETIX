import { Result } from '../logic/Result';
import { VideoState } from '../states/Video.state';
import Entity from './Entity';
import Thumbnail from './Thumbnail';
import UniqueEntityID from './UniqueEntityID';
import VideoMetadata from './VideoMetadata';

interface VideoProps {
  state: VideoState;
  path: string;
  uploaderId: UniqueEntityID;
  thumbnail: Thumbnail;
  metadata: VideoMetadata;
}

export default class Video extends Entity<VideoProps> {
  constructor(props: VideoProps, uuid?: UniqueEntityID) {
    super(props, uuid);
  }

  public static create(props: VideoProps, uuid?: UniqueEntityID): Result<Video> {
    if (!props.state) {
      return Result.fail<Video>('State is required');
    }
    if (!Object.values(VideoState).includes(props.state)) {
      return Result.fail<Video>('Invalid state');
    }
    if (!props.path) {
      return Result.fail<Video>('Path is required');
    }
    if (!props.uploaderId) {
      return Result.fail<Video>('Uploader is required');
    }
    if (!props.thumbnail) {
      return Result.fail<Video>('Thumbnail is required');
    }
    if (!props.metadata) {
      return Result.fail<Video>('Metadata is required');
    }

    const newVideo = new Video(props, uuid);

    return Result.ok<Video>(newVideo);
  }
}
