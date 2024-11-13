import { getQueueToken } from '@nestjs/bullmq';
import { Test, TestingModule } from '@nestjs/testing';
import { Video, VideoState } from './entity/video.entity';
import { DELETE_VIDEO_QUEUE, PROCESS_VIDEO_QUEUE } from './videos.constants';
import { VideosController } from './videos.controller';
import { VideosRepository } from './videos.repository';
import { VideosService } from './videos.service';

describe('VideosController Integration', () => {
  let controller: VideosController;

  const videosRepositoryMock = {
    findOneByUUID: (id: string) => {
      const video = Video.create({
        uuid: id,
        name: 'some-name',
        state: VideoState.PROCESSING,
      });

      return video;
    },
  };

  const videoQueueMock = {
    add: jest.fn(),
  };

  const deleteVideoQueueMock = {
    add: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [
        { provide: VideosRepository, useValue: videosRepositoryMock },
        { provide: getQueueToken(PROCESS_VIDEO_QUEUE), useValue: videoQueueMock },
        { provide: getQueueToken(DELETE_VIDEO_QUEUE), useValue: deleteVideoQueueMock },
        VideosService,
      ],
    }).compile();

    controller = module.get<VideosController>(VideosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get a video', async () => {
    const video = await controller.getVideo('123');

    expect(video).toBeDefined();
    expect(video.id).toBe('123');
    expect(video.name).toBe('some-name');
    expect(video.state).toBe(VideoState.PROCESSING);
  });
});
