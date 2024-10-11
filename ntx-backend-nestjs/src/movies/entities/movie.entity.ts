import { Title } from '@ntx/common/interfaces/title.interface';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { generateHash } from '@ntx/common/utils/generate-hash.utils';
import { generateUniqueID } from '@ntx/common/utils/ID.utils';
import { IsBoolean, IsDate, IsInt, IsOptional, IsString, Length, Matches, Max, Min } from 'class-validator';
import {
  MOVIES_ID_LENGTH,
  MOVIES_ID_PREFIX,
  MOVIES_NAME_LENGTH_MAX,
  MOVIES_NAME_LENGTH_MIN,
  MOVIES_POSTER_DEFAULT_ID,
  MOVIES_RUNTIME_MINS_MAX,
  MOVIES_RUNTIME_MINS_MIN,
  MOVIES_SUMMARY_LENGTH_MAX,
  MOVIES_SUMMARY_LENGTH_MIN,
} from '../movies.constants';

export interface MovieProps {
  uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  posterID?: string;
  name: string;
  originallyReleasedAt: Date;
  summary: string;
  isPublished?: boolean;
  runtimeMinutes: number;
  videoID?: string;
}

export class Movie implements Title {
  @IsString()
  uuid: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  posterID: string;

  @IsString()
  @Length(MOVIES_NAME_LENGTH_MIN, MOVIES_NAME_LENGTH_MAX)
  name: string;

  @Matches(TitleType.MOVIE)
  type: TitleType;

  @IsString()
  hash: string;

  @IsBoolean()
  isPublished: boolean;

  @IsDate()
  originallyReleasedAt: Date;

  @IsString()
  @Length(MOVIES_SUMMARY_LENGTH_MIN, MOVIES_SUMMARY_LENGTH_MAX)
  summary: string;

  @IsInt()
  @Min(MOVIES_RUNTIME_MINS_MIN)
  @Max(MOVIES_RUNTIME_MINS_MAX)
  runtimeMinutes: number;

  @IsString()
  @IsOptional()
  videoID?: string;

  public static async create(props: MovieProps): Promise<Movie> {
    const movie = await createValidatedObject(Movie, {
      uuid: props.uuid || this.generateUUID(),
      createdAt: props.createdAt || new Date(),
      updatedAt: props.updatedAt || new Date(),
      posterID: props.posterID || MOVIES_POSTER_DEFAULT_ID,
      name: props.name,
      type: TitleType.MOVIE,
      hash: this.createHash(props),
      isPublished: props.isPublished || false,
      originallyReleasedAt: props.originallyReleasedAt,
      summary: props.summary,
      runtimeMinutes: props.runtimeMinutes,
      videoID: props.videoID,
    });

    return movie;
  }

  public static generateUUID(): string {
    return generateUniqueID(MOVIES_ID_PREFIX, MOVIES_ID_LENGTH);
  }

  public static createHash({ name, originallyReleasedAt }: Pick<Movie, 'name' | 'originallyReleasedAt'>): string {
    return generateHash(name, originallyReleasedAt.toDateString());
  }
}
