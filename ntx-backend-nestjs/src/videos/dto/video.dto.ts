import { IsDate, IsEnum, IsString, Length } from 'class-validator';
import { VideoState } from '../entity/video.entity';
import { VIDEOS_NAME_LENGTH_MAX, VIDEOS_NAME_LENGTH_MIN } from '../videos.constants';

export class VideoDTO {
  @IsString()
  id: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;

  @IsString()
  @Length(VIDEOS_NAME_LENGTH_MIN, VIDEOS_NAME_LENGTH_MAX)
  name: string;

  @IsEnum(VideoState)
  state: VideoState;
}
