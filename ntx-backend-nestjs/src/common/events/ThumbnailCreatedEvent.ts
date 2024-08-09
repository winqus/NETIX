import { Thumbnail } from '@ntx/thumbnails/interfaces/thumbnail.interface';

export default class ThumbnailCreatedForTitleEvent {
  constructor(
    public readonly titleUUID: string,
    public readonly thumbnail: Thumbnail,
  ) {}
}
