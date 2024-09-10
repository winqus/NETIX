import { Thumbnail } from '@ntx/thumbnails-legacy/interfaces/thumbnail.interface';
import { IsObject, IsUUID } from 'class-validator';

export class SetTitleThumbnailDTO {
  @IsUUID(4)
  titleUUID: string;

  @IsObject()
  thumbnail: Thumbnail;
}
