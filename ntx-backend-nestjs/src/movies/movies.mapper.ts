import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { MovieDTO } from './dto/movie.dto';
import { Movie } from './entities/movie.entity';

export class MoviesMapper {
  public static async any2Movie(any: any): Promise<Movie> {
    const movie = createValidatedObject(Movie, {
      uuid: any.uuid,
      createdAt: any.createdAt,
      updatedAt: any.updatedAt,
      name: any.name,
      summary: any.summary,
      originallyReleasedAt: any.originallyReleasedAt,
      runtimeMinutes: any.runtimeMinutes,
      posterID: any.posterID,
      videoID: any.videoID,
      hash: any.hash,
      type: any.type,
    });

    return movie;
  }

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
