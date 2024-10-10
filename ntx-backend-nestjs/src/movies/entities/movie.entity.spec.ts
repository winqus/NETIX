import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { generateHash } from '@ntx/common/utils/generate-hash.utils';
import { MOVIES_ID_LENGTH, MOVIES_ID_PREFIX, MOVIES_POSTER_DEFAULT_ID } from '../movies.constants';
import { Movie, MovieProps } from './movie.entity';

describe('Movie', () => {
  describe('create', () => {
    it('should create a valid Movie object with valid props', async () => {
      const props: MovieProps = {
        name: 'Test Movie',
        originallyReleasedAt: new Date('2020-01-01'),
        summary: 'A test movie',
        runtimeMinutes: 120,
      };

      const movie = await Movie.create(props);

      expect(movie).toBeInstanceOf(Movie);
      expect(movie.uuid).toMatch(new RegExp(`^${MOVIES_ID_PREFIX}`));
      expect(movie.createdAt).toBeInstanceOf(Date);
      expect(movie.updatedAt).toBeInstanceOf(Date);
      expect(movie.posterID).toBe(MOVIES_POSTER_DEFAULT_ID);
      expect(movie.name).toBe(props.name);
      expect(movie.type).toBe(TitleType.MOVIE);
      expect(movie.originallyReleasedAt).toBeInstanceOf(Date);
      expect(movie.summary).toBe(props.summary);
      expect(movie.runtimeMinutes).toBe(props.runtimeMinutes);
      expect(movie.videoID).toBeUndefined();
      expect(movie.hash).toBeDefined();
      expect(movie.isPublished).toBe(false);
    });

    it('should generate uuid if not provided', async () => {
      const props: MovieProps = {
        name: 'Test Movie',
        originallyReleasedAt: new Date(),
        summary: 'A test movie',
        runtimeMinutes: 120,
      };

      const movie = await Movie.create(props);

      expect(movie.uuid).toBeDefined();
      expect(movie.uuid).toHaveLength(MOVIES_ID_PREFIX.length + MOVIES_ID_LENGTH);
      expect(movie.uuid.startsWith(MOVIES_ID_PREFIX)).toBe(true);
    });

    it('should use default posterID if not provided', async () => {
      const props: MovieProps = {
        name: 'Another Test Movie',
        originallyReleasedAt: new Date(),
        summary: 'Another test movie',
        runtimeMinutes: 90,
      };

      const movie = await Movie.create(props);

      expect(movie.posterID).toBe(MOVIES_POSTER_DEFAULT_ID);
    });

    it('should throw validation error when invalid props are provided', async () => {
      const props = {
        originallyReleasedAt: new Date(),
        summary: 'A test movie with invalid name',
      };

      Movie.create(props as MovieProps).catch((error) => {
        expect(error).toBeDefined();
      });
    });

    it('should generate hash using name and originallyReleasedAt', async () => {
      const props: MovieProps = {
        name: 'Hash Test Movie',
        originallyReleasedAt: new Date('2021-05-15'),
        summary: 'Testing hash generation',
        runtimeMinutes: 110,
      };

      const movie = await Movie.create(props);

      const expectedHash = generateHash(props.name, props.originallyReleasedAt.toDateString());
      expect(movie.hash).toBe(expectedHash);
    });
  });

  describe('generateUUID', () => {
    it('should generate a unique ID with correct prefix and length', () => {
      const uuid = Movie.generateUUID();

      expect(uuid).toBeDefined();
      expect(uuid).toHaveLength(MOVIES_ID_PREFIX.length + MOVIES_ID_LENGTH);
      expect(uuid.startsWith(MOVIES_ID_PREFIX)).toBe(true);
    });
  });

  describe('createHash', () => {
    it('should generate hash from name and originallyReleasedAt', () => {
      const name = 'Hash Function Movie';
      const originallyReleasedAt = new Date('2022-08-20');

      const hash = Movie.createHash({ name, originallyReleasedAt });

      const expectedHash = generateHash(name, originallyReleasedAt.toDateString());
      expect(hash).toBe(expectedHash);
    });
  });
});
