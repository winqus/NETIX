import { TestBed } from '@automock/jest';
import { VideosController } from './videos.controller';

describe('VideosController', () => {
  let videosController: VideosController;

  beforeAll(() => {
    const { unit } = TestBed.create(VideosController).compile();

    videosController = unit;
  });

  it('should be defined', () => {
    expect(videosController).toBeDefined();
  });
});
