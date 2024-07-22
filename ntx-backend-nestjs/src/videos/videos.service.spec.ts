import { TestBed } from '@automock/jest';
import { VideosService } from './videos.service';

describe('VideosService', () => {
  let videosService: VideosService;

  beforeAll(() => {
    const { unit } = TestBed.create(VideosService).compile();

    videosService = unit;
  });

  it('should be defined', () => {
    expect(videosService).toBeDefined();
  });
});
