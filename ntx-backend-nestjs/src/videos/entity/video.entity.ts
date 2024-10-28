import { Entity } from '@ntx/common/interfaces/entity.interface';
import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { generateUniqueID } from '@ntx/common/utils/ID.utils';
import { IsDate, IsInt, IsString, Length, Max, Min } from 'class-validator';
import {
  VIDEOS_ID_LENGTH,
  VIDEOS_ID_PREFIX,
  VIDEOS_NAME_LENGTH_MAX,
  VIDEOS_NAME_LENGTH_MIN,
  VIDEOS_RUNTIME_MINS_MAX,
  VIDEOS_RUNTIME_MINS_MIN,
} from '../videos.constants';

export interface VideoProps {
  uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  name: string;
  runtimeMinutes: number;
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

  @IsInt()
  @Min(VIDEOS_RUNTIME_MINS_MIN)
  @Max(VIDEOS_RUNTIME_MINS_MAX)
  runtimeMinutes: number;

  public static async create(props: VideoProps): Promise<Video> {
    const movie = await createValidatedObject(Video, {
      uuid: props.uuid || this.generateUUID(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
      name: props.name,
      runtimeMinutes: props.runtimeMinutes,
    });

    return movie;
  }

  public static generateUUID(): string {
    return generateUniqueID(VIDEOS_ID_PREFIX, VIDEOS_ID_LENGTH);
  }
}
