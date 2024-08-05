import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@ntx/common/Result';
import { Title } from './interfaces/title.interface';
import { TitlesRepository } from './titles.repository';

@Injectable()
export class TitlesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly titlesRepository: TitlesRepository) {}

  public async getAllTitles(): Promise<Result<Title[]>> {
    try {
      const titles = await this.titlesRepository.find({});

      return Result.ok(titles || []);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  // TODO: Handle Video Created Event, assign video ID to title
  // @OnEvent(VIDEO_PROCESSED_EVENT)
  // private async handleVideoProcessedEvent(payload: VideoProcessedEvent) {
  //   const { titleID, videoID } = payload;

  //   const title = await this.titlesRepository.findOne({ uuid: titleID });

  //   if (title == null) {
  //     this.logger.error(`Title not found: ${titleID}`);

  //     return;
  //   }

  //   this.logger.log(`Assigned video ID ${videoID} to title ${titleID}`);
  // }

  // TODO: Handle Thumbnail Created Event, assign thumbnail ID to title
}
