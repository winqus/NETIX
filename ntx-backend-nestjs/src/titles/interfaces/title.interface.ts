import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { ThumbnailCategory } from '@ntx/thumbnails/interfaces/thumbnailCategory.enum';
import { ThumbnailFormat } from '@ntx/thumbnails/interfaces/thumbnailFormat.enum';
import { VideoCategory } from '@ntx/videos/interfaces/videoCategory.enum';
import { Document } from 'mongoose';
import { TitleCategory } from './titleCategory.enum';

export interface TitleTitle {
  type: TitleCategory;
  title: string;
  language: string;
}

export interface TitleVideo {
  type: VideoCategory;
  uuid: string;
}

export interface TitleThumbnail {
  type: ThumbnailCategory;
  uuid: string;
  formart: ThumbnailFormat;
}

export interface Title extends Document {
  readonly uuid: string;
  readonly type: TitleType;
  readonly titles: TitleTitle;
  readonly videos?: { list: TitleVideo[] };
  readonly thumbnails?: { list: TitleThumbnail[] };
}
