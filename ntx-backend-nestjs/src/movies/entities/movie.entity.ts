import { Title } from '@ntx/common/interfaces/title.interface';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { generateHash } from '@ntx/common/utils/generate-hash.utils';
import { generateUniqueID } from '@ntx/common/utils/ID.utils';
import { IsDate, IsInt, IsOptional, IsPositive, IsString, Length, Matches, Max, Min } from 'class-validator';
import { MOVIES_ID_LENGTH, MOVIES_ID_PREFIX, MOVIES_POSTER_DEFAULT_ID } from '../movies.constants';

export interface MovieProps {
  uuid?: string;
  createdAt?: Date;
  updatedAt?: Date;
  posterID?: string;
  name: string;
  originallyReleasedAt: Date;
  summary: string;
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
  @Length(1, 200)
  name: string;

  @Matches(TitleType.MOVIE)
  type: TitleType;

  @IsString()
  hash: string;

  @IsDate()
  originallyReleasedAt: Date;

  @IsString()
  @Length(1, 1000)
  summary: string;

  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(12_000)
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
      originallyReleasedAt: props.originallyReleasedAt,
      summary: props.summary,
      runtimeMinutes: props.runtimeMinutes,
      videoID: props.videoID,
      hash: this.createHash(props),
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
