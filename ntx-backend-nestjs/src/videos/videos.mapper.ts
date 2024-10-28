import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { Video } from './entity/video.entity';

export class VideosMapper {
  public static async any2Video(any: any): Promise<Video> {
    const video = createValidatedObject(Video, {
      uuid: any.uuid,
      createdAt: any.createdAt,
      updatedAt: any.updatedAt,
      name: any.name,
      runtimeMinutes: any.runtimeMinutes,
    });

    return video;
  }

  public static async any2Videos(any: any[]): Promise<Video[]> {
    return Promise.all(any.map((a) => VideosMapper.any2Video(a)));
  }
}
