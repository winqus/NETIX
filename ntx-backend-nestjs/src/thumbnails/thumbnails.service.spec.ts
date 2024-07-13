import { Test, TestingModule } from '@nestjs/testing';
import { ThumbnailsService } from './thumbnails.service';

describe('ThumbnailsService', () => {
  let service: ThumbnailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ThumbnailsService],
    }).compile();

    service = module.get<ThumbnailsService>(ThumbnailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
