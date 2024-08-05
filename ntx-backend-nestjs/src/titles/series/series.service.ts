import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { Result } from '@ntx/common/Result';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';
import VideoProcessedEvent from '@ntx/videos/events/VideoProcessedEvent';
import { VIDEO_PROCESSED_EVENT } from '@ntx/videos/videos.constants';
import { validateOrReject } from 'class-validator';
import { CreateSeriesTitleDTO } from './dto/CreateSeriesTitle.dto';
import { SeriesTitle } from './interfaces/seriesTitle.interface';
import { SeriesRepository } from './series.repository';

@Injectable()
export class SeriesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly repository: SeriesRepository) {}

  public async create(createDTO: CreateSeriesTitleDTO): Promise<Result<SeriesTitle>> {
    try {
      await validateOrReject(createDTO);

      const title: SeriesTitle = {
        uuid: generateUUIDv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        thumbnails: [],
        names: createDTO.names,
        releaseDate: createDTO.releaseDate,
        type: TitleType.SERIES,
        seasons: [],
      };

      const newTitle = await this.repository.create(title);

      this.logger.log(`Created new series title: ${newTitle.uuid}`);

      return Result.ok(newTitle);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  // TODO: Handle Video Created Event, assign video ID to title
  // @OnEvent(VIDEO_PROCESSED_EVENT)
  // private async handleVideoProcessedEvent(payload: VideoProcessedEvent) {
  //   const { titleID, videoID } = payload;

  //   const title = await this.moviesRepository.findOne({ uuid: titleID });

  //   if (title == null) {
  //     this.logger.error(`Title not found: ${titleID}`);

  //     return;
  //   }

  //   this.logger.log(`Assigned video ID ${videoID} to title ${titleID}`);
  // }
}
