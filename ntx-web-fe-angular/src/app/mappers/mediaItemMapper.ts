import { MediaItem } from '../models/mediaItem';

export class MediaItemMapper {
  public static toMediaItem(raw: any): MediaItem {
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description || '',
      duration: raw.duration,
      releaseDate: raw.releaseDate,
      creator: raw.creator || { id: 'unknown', name: 'unknown' },
      thumbnails: raw.thumbnails,
      tags: raw.tags || [],
      categories: raw.categories || [],
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
    } as MediaItem;
  }

  public static toMediaItemList(raw: any[]): MediaItem[] {
    return raw.map((x) => MediaItemMapper.toMediaItem(x));
  }
}
