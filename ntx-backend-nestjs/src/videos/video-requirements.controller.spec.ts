import { Test, TestingModule } from '@nestjs/testing';
import { VideoRequirementsController } from './video-requirements.controller';

describe('VideosController', () => {
  let controller: VideoRequirementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideoRequirementsController],
    }).compile();

    controller = module.get<VideoRequirementsController>(VideoRequirementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
