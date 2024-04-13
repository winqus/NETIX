import { inRange } from '../../utils/mathUtils';
import { Result } from '../logic/Result';
import { MetadataUploadState, ThumbnailUploadState, VideoUploadRequestState, VideoUploadState } from '../states/VideoUploadRequest.state';
import Entity from './Entity';
import UniqueEntityID from './UniqueEntityID';

interface VideoUploadRequestProps {
  videoId: UniqueEntityID;
  requesterId: UniqueEntityID;
  videoState: VideoUploadState;
  thumbnailId?: UniqueEntityID;
  thumbnailState: ThumbnailUploadState;
  metadataId?: UniqueEntityID;
  metadataState: MetadataUploadState;
  overallState: VideoUploadRequestState;
  chunksReceived: number;
  totalChunks: number;
}

export default class VideoUploadRequest extends Entity<VideoUploadRequestProps> {
  get videoId(): UniqueEntityID {
    return this.props.videoId;
  }

  get requesterId(): UniqueEntityID {
    return this.props.requesterId;
  }

  get videoState(): VideoUploadState {
    return this.props.videoState;
  }

  set videoState(state: VideoUploadState) {
    if (!Object.values(VideoUploadState).includes(state)) {
      throw new Error('Invalid video state');
    }

    this.props.videoState = state;
  }

  get thumbnailState(): ThumbnailUploadState {
    return this.props.thumbnailState;
  }

  set thumbnailState(state: ThumbnailUploadState) {
    if (!Object.values(ThumbnailUploadState).includes(state)) {
      throw new Error('Invalid thumbnail state');
    }

    this.props.thumbnailState = state;
  }

  get metadataState(): MetadataUploadState {
    return this.props.metadataState;
  }

  set metadataState(state: MetadataUploadState) {
    if (!Object.values(MetadataUploadState).includes(state)) {
      throw new Error('Invalid metadata state');
    }

    this.props.metadataState = state;
  }

  get overallState(): VideoUploadRequestState {
    return this.props.overallState;
  }

  set overallState(state: VideoUploadRequestState) {
    if (!Object.values(VideoUploadRequestState).includes(state)) {
      throw new Error('Invalid overall state');
    }

    this.props.overallState = state;
  }

  get chunksReceived(): number {
    return this.props.chunksReceived;
  }

  get chunksRemaining(): number {
    return this.totalChunks - this.chunksReceived;
  }

  set chunksReceived(chunks: number) {
    if (!inRange(chunks, 0, this.totalChunks) || !Number.isInteger(chunks)) {
      throw new Error('Invalid chunks received');
    }

    this.props.chunksReceived = chunks;
  }

  get totalChunks(): number {
    return this.props.totalChunks;
  }

  private constructor(props: VideoUploadRequestProps, uuid: UniqueEntityID) {
    super(props, uuid);
  }

  public static create(props: VideoUploadRequestProps, uuid?: UniqueEntityID): Result<VideoUploadRequest> {
    if (!props.videoId) {
      return Result.fail<VideoUploadRequest>('Title is required');
    }

    if (!props.requesterId) {
      return Result.fail<VideoUploadRequest>('Requester ID is required');
    }

    if (!props.videoState) {
      return Result.fail<VideoUploadRequest>('Video state is required');
    }

    if (!Object.values(VideoUploadState).includes(props.videoState)) {
      return Result.fail<VideoUploadRequest>('Invalid video state');
    }

    if (!props.thumbnailState) {
      return Result.fail<VideoUploadRequest>('Thumbnail state is required');
    }

    if (!Object.values(ThumbnailUploadState).includes(props.thumbnailState)) {
      return Result.fail<VideoUploadRequest>('Invalid thumbnail state');
    }

    if (!props.metadataState) {
      return Result.fail<VideoUploadRequest>('Metadata state is required');
    }

    if (!Object.values(MetadataUploadState).includes(props.metadataState)) {
      return Result.fail<VideoUploadRequest>('Invalid metadata state');
    }

    if (!props.overallState) {
      return Result.fail<VideoUploadRequest>('Overall state is required');
    }

    if (!Object.values(VideoUploadRequestState).includes(props.overallState)) {
      return Result.fail<VideoUploadRequest>('Invalid overall state');
    }

    if (!props.chunksReceived) {
      return Result.fail<VideoUploadRequest>('Chunks received is required');
    }

    if (!inRange(props.chunksReceived, 0, props.totalChunks) || !Number.isInteger(props.chunksReceived)) {
      return Result.fail<VideoUploadRequest>('Invalid chunks received');
    }

    if (!props.totalChunks) {
      return Result.fail<VideoUploadRequest>('Total chunks is required');
    }

    if (props.totalChunks < 1 || !Number.isInteger(props.totalChunks)) {
      return Result.fail<VideoUploadRequest>('Invalid total chunks');
    }

    const newVideo = new VideoUploadRequest(props, uuid || new UniqueEntityID());

    return Result.ok<VideoUploadRequest>(newVideo);
  }
}
