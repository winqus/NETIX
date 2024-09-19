import { CreateMovieDTO } from '@ntx/movies/dto/create-movie.dto';

export const createRandomValidCreateMovieDTO = (): CreateMovieDTO => ({
  name: `test-name-${Math.random()}`,
  summary: `short-test-summary-${Math.random()}`,
  originallyReleasedAt: new Date('1999-01-05'),
  runtimeMinutes: 123,
});
