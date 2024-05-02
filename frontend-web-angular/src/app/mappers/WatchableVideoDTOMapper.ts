import { MediaItem } from '../models/mediaItem';
import WatchableVideoDTO from '../models/watchableVideo.dto';

export class WatchableVideoDTOMapper {
  public static toMediaItem(dto: WatchableVideoDTO): MediaItem {
    return {
      id: dto.uploadID,
      title: dto.metadata.description.title,
      description: '',
      duration: 0,
      releaseDate: new Date(dto.metadata.description.publishDatetime),
      creator: { id: 'unknown', name: 'unknown' },
      thumbnails: {
        default: `/api/v1/thumbnail/${dto.uploadID}`,
      },
      tags: [],
      categories: [],
      createdAt: new Date(dto.createdDateTime),
      updatedAt: new Date(dto.uploadedDateTime),
      state: dto.state,
      ready: dto.ready,
    } as MediaItem;
  }

  public static toMediaItemList(dtos: WatchableVideoDTO[]): MediaItem[] {
    return dtos.map((x) => WatchableVideoDTOMapper.toMediaItem(x));
  }
}
