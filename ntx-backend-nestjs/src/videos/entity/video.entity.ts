import { FileExt } from '@ntx/common/enums/file-extentions.enum';
import { MimeType } from '@ntx/common/enums/mime-type.enum';
import { Entity } from '@ntx/common/interfaces/entity.interface';
import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { generateUniqueID } from '@ntx/common/utils/ID.utils';
import { IsDate, IsEnum, IsInt, IsString, Length } from 'class-validator';
import {
  VIDEOS_ID_LENGTH,
  VIDEOS_ID_PREFIX,
  VIDEOS_NAME_LENGTH_MAX,
  VIDEOS_NAME_LENGTH_MIN,
} from '../videos.constants';

export enum VideoState {
  NOT_READY = 'NOT_READY',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export interface VideoProps {
  uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  name: string;
  state: VideoState;
  sizeInBytes?: number;
  mimeType?: MimeType;
  fileExtention?: FileExt;
}

export class Video implements Entity {
  @IsString()
  uuid: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  @Length(VIDEOS_NAME_LENGTH_MIN, VIDEOS_NAME_LENGTH_MAX)
  name: string;

  @IsString()
  state: VideoState;

  @IsInt()
  sizeInBytes: number;

  @IsEnum(MimeType)
  mimeType: MimeType;

  @IsEnum(FileExt)
  fileExtention: FileExt;

  public static async create(props: VideoProps): Promise<Video> {
    const movie = await createValidatedObject(Video, {
      uuid: props.uuid ?? this.generateUUID(),
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
      name: props.name,
      state: props.state,
      sizeInBytes: props.sizeInBytes ?? 0,
      mimeType: props.mimeType ?? MimeType.VIDEO_X_MATROSKA,
      fileExtention: props.fileExtention ?? FileExt.MKV,
    });

    return movie;
  }

  public static generateUUID(): string {
    return generateUniqueID(VIDEOS_ID_PREFIX, VIDEOS_ID_LENGTH);
  }
}
