import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FileInStorage } from '@ntx/file-storage/types';
import { VideoDTO } from './dto/video.dto';
import { Video, VideoState } from './entity/video.entity';
import { ProcessVideoJobPayload, ProcessVideoQueue } from './queues/process-video.types';
import {
  PROCESS_VIDEO_JOBNAME,
  PROCESS_VIDEO_QUEUE,
  VIDEOS_ERROR_NO_ID_PROVIDED,
  VIDEOS_ERROR_NOT_FOUND,
} from './videos.constants';
import { VideosMapper } from './videos.mapper';
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

  public async findOne(id: string): Promise<VideoDTO> {
    try {
      if (id == null) {
        throw new BadRequestException(VIDEOS_ERROR_NO_ID_PROVIDED);
      }

      const video = await this.videosRepository.findOneByUUID(id);

      if (video == null) {
        throw new NotFoundException(VIDEOS_ERROR_NOT_FOUND);
      }

      return VideosMapper.Video2VideoDTO(video);
    } catch (error) {
      this.logger.error(`Failed to find video with this ${id}: ${error.message}`);
      throw error;
    }
  }
}
