import { MediaItem } from '../models/mediaItem';

export class MediaItemMapper {
  public static toMediaItem(raw: any): MediaItem {
    return {
      id: raw.id,
      title: raw.title,
      description: raw.description || '',
      duration: raw.duration,
      creator: raw.creator || { id: 'unknown', name: 'unknown' },
      thumbnails: raw.thumbnails,
      tags: raw.tags || [],
      categories: raw.categories || [],
      publishedAt: new Date(raw.publishedAt),
      updatedAt: new Date(raw.updatedAt),
    } as MediaItem;
  }

  public static toMediaItemList(raw: any[]): MediaItem[] {
    return raw.map((x) => MediaItemMapper.toMediaItem(x));
  }
}
