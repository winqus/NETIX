import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { VideoDTO } from './dto/video.dto';
import { Video } from './entity/video.entity';

export class VideosMapper {
  public static async any2Video(any: any): Promise<Video> {
    const video = createValidatedObject(Video, {
      uuid: any.uuid,
      createdAt: any.createdAt,
      updatedAt: any.updatedAt,
      name: any.name,
      state: any.state,
    });

    return video;
  }

  public static async any2Videos(any: any[]): Promise<Video[]> {
    return Promise.all(any.map((a) => VideosMapper.any2Video(a)));
  }

  public static async Video2VideoDTO(video: Video): Promise<VideoDTO> {
    const videoDTO = createValidatedObject(VideoDTO, {
      id: video.uuid,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      name: video.name,
      state: video.state,
    });

    return videoDTO;
  }

  public static async Videos2VideoDTOs(videos: Video[]): Promise<VideoDTO[]> {
    return Promise.all(videos.map((v) => VideosMapper.Video2VideoDTO(v)));
  }
}
