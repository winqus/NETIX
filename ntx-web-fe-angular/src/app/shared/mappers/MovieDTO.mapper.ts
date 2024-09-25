import { MovieDTO } from '../models/movie.dto';

export class MovieDTOMapper {
  static toMetadataItem(item: any): MovieDTO {
    return {
      id: item.id,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      name: item.name,
      summary: item.summary,
      originallyReleasedAt: new Date(item.originallyReleasedAt),
      runtimeMinutes: item.runtimeMinutes,
      posterID: item.posterID,
      videoID: item.videoID || null,
    };
  }
}
