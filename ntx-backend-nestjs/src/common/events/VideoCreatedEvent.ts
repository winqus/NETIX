import { Video } from '@ntx/videos/interfaces/video.interface';

export default class VideoCreatedForTitleEvent {
  constructor(
    public readonly titleUUID: string,
    public readonly video: Video,
  ) {}
}
