import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { VideoDTO } from './dto/video.dto';
import { Video } from './entity/video.entity';

export class VideosMapper {
  public static async any2Video(any: any): Promise<Video> {
    const video = await createValidatedObject(Video, {
      uuid: any.uuid,
      createdAt: any.createdAt,
      updatedAt: any.updatedAt,
      name: any.name,
      state: any.state,
      sizeInBytes: any.sizeInBytes,
      mimeType: any.mimeType,
      fileExtention: any.fileExtention,
    });

    return video;
  }

  public static async any2Videos(any: any[]): Promise<Video[]> {
    return await Promise.all(any.map((a) => VideosMapper.any2Video(a)));
  }

  public static async Video2VideoDTO(video: Video): Promise<VideoDTO> {
    const videoDTO = await createValidatedObject(VideoDTO, {
      id: video.uuid,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      name: video.name,
      state: video.state,
      sizeInBytes: video.sizeInBytes,
      mimeType: video.mimeType,
      fileExtention: video.fileExtention,
    });

    return videoDTO;
  }

  public static async Videos2VideoDTOs(videos: Video[]): Promise<VideoDTO[]> {
    return await Promise.all(videos.map((v) => VideosMapper.Video2VideoDTO(v)));
  }
}
