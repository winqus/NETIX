import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { MovieDTO } from './dto/movie.dto';
import { Movie } from './entities/movie.entity';

export class MoviesMapper {
  public static async Movie2MovieDTO(movie: Movie): Promise<MovieDTO> {
    const movieDTO = createValidatedObject(MovieDTO, {
      id: movie.uuid,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      name: movie.name,
      summary: movie.summary,
      originallyReleasedAt: movie.originallyReleasedAt,
      runtimeMinutes: movie.runtimeMinutes,
      posterID: movie.posterID,
      videoID: movie.videoID,
    });

    return movieDTO;
  }
}
