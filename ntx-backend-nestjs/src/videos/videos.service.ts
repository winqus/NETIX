import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { FileInStorage } from '@ntx/file-storage/types';
import { Video, VideoState } from './entity/video.entity';
import { ProcessVideoJobPayload, ProcessVideoQueue } from './queues/process-video.types';
import { PROCESS_VIDEO_JOBNAME, PROCESS_VIDEO_QUEUE } from './videos.constants';
import { VideosRepository } from './videos.repository';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly videosRepository: VideosRepository,
    @InjectQueue(PROCESS_VIDEO_QUEUE) private readonly videoQueue: ProcessVideoQueue,
  ) {}

  public async createOneFromFile(videoName: string, videoFile: FileInStorage): Promise<Video> {
    const newVideo = await Video.create({
      name: videoName,
      state: VideoState.NOT_READY,
    });

    const payload: ProcessVideoJobPayload = {
      videoID: newVideo.uuid,
      file: videoFile,
    };

    await this.videoQueue.add(PROCESS_VIDEO_JOBNAME, payload);

    return this.videosRepository.createOne(newVideo);
  }
}
