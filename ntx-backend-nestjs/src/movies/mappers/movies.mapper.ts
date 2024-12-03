import { createValidatedObject } from '@ntx/common/utils/class-validation.utils';
import { MovieDTO } from '../dto/movie.dto';
import { Movie } from '../entities/movie.entity';

export class MoviesMapper {
  public static async any2Movie(any: any): Promise<Movie> {
    const movie = await createValidatedObject(Movie, {
      uuid: any.uuid,
      createdAt: any.createdAt,
      updatedAt: any.updatedAt,
      name: any.name,
      summary: any.summary,
      type: any.type,
      originallyReleasedAt: any.originallyReleasedAt,
      hash: any.hash,
      isPublished: any.isPublished,
      runtimeMinutes: any.runtimeMinutes,
      posterID: any.posterID,
      backdropID: any.backdropID,
      videoID: any.videoID,
    });

    return movie;
  }

  public static async any2Movies(any: any[]): Promise<Movie[]> {
    return await Promise.all(any.map((a) => MoviesMapper.any2Movie(a)));
  }

  public static async Movie2MovieDTO(movie: Movie): Promise<MovieDTO> {
    const movieDTO = await createValidatedObject(MovieDTO, {
      id: movie.uuid,
      createdAt: movie.createdAt,
      updatedAt: movie.updatedAt,
      name: movie.name,
      summary: movie.summary,
      originallyReleasedAt: movie.originallyReleasedAt,
      isPublished: movie.isPublished,
      runtimeMinutes: movie.runtimeMinutes,
      posterID: movie.posterID,
      backdropID: movie.backdropID,
      videoID: movie.videoID,
    });

    return movieDTO;
  }

  public static async Movies2MovieDTOs(movies: Movie[]): Promise<MovieDTO[]> {
    return await Promise.all(movies.map((m) => MoviesMapper.Movie2MovieDTO(m)));
  }
}
