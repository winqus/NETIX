import { Test, TestingModule } from '@nestjs/testing';
import { THUMBNAIL_QUEUE } from './thumbnails.constants';
import { ThumbnailsService } from './thumbnails.service';

describe('ThumbnailsService', () => {
  let service: ThumbnailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThumbnailsService,
        {
          provide: `BullQueue_${THUMBNAIL_QUEUE}`,
          useValue: {
            add: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ThumbnailsService>(ThumbnailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
