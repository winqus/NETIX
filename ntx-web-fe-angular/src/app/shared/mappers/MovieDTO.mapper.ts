import { MovieDTO } from '../models/movie.dto';

export class MovieDTOMapper {
  static anyToMovieDTOArray(items: any[]): MovieDTO[] {
    return items.map((item) => this.anyToMovieDTO(item));
  }

  static anyToMovieDTO(item: any): MovieDTO {
    return {
      id: item.id,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      name: item.name,
      summary: item.summary,
      originallyReleasedAt: new Date(item.originallyReleasedAt),
      runtimeMinutes: item.runtimeMinutes,
      posterID: item.posterID,
      backdropID: item.backdropID,
      videoID: item.videoID || null,
      isPublished: item.isPublished || false,
    };
  }
}
