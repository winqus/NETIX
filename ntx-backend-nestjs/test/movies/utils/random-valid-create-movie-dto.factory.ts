import { CreateMovieDTO } from '@ntx/movies/dto/create-movie.dto';

export const createRandomValidCreateMovieDTO = (): CreateMovieDTO => {
  const baseDate = new Date('1999-01-05').getTime();
  const randomMs = Math.random() * 1000 * 60 * 60 * 24 * 365; /* up to 365 days in milliseconds */
  const randomDate = new Date(baseDate + randomMs);

  return {
    name: `test-name-${Math.random()}`,
    summary: `short-test-summary-${Math.random()}`,
    originallyReleasedAt: randomDate,
    runtimeMinutes: 123,
  };
};
