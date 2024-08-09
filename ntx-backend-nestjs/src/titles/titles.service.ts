import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NtxEvent } from '@ntx/common/events';
import ThumbnailCreatedForTitleEvent from '@ntx/common/events/ThumbnailCreatedEvent';
import { Result } from '@ntx/common/Result';
import { isValidUUID } from '@ntx/utility/isValidUUID';
import { validateOrReject } from 'class-validator';
import { SetTitleThumbnailDTO } from './dto/SetTitleThumbnail.dto';
import { Title } from './interfaces/title.interface';
import { TitlesRepository } from './titles.repository';

@Injectable()
export class TitlesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly titlesRepository: TitlesRepository) {}

  public async exists(titleUUID: string): Promise<boolean> {
    try {
      if (isValidUUID(titleUUID) === false) {
        this.logger.warn(`Invalid UUID: ${titleUUID}`);

        return false;
      }

      const title = await this.titlesRepository.findOne({ uuid: titleUUID });

      return title != null;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async getAllTitles(): Promise<Result<Title[]>> {
    try {
      const titles = await this.titlesRepository.find({});

      return Result.ok(titles || []);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async setThumbnail(dto: SetTitleThumbnailDTO): Promise<boolean> {
    try {
      validateOrReject(dto);

      const updatedTitle = await this.titlesRepository.findOneAndUpdate(
        { uuid: dto.titleUUID },
        { thumbnail: dto.thumbnail },
      );

      if (updatedTitle == null) {
        this.logger.error(`Title ${dto.titleUUID} not found to set thumbnail`);
      }

      this.logger.log(`Title ${updatedTitle!.uuid} thumbnail set to ${updatedTitle!.thumbnail!.uuid}`);

      return updatedTitle != null;
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @OnEvent(NtxEvent.ThumbnailCreatedForTitle)
  private async handleThumbnailCreatedForTitleEvent(payload: ThumbnailCreatedForTitleEvent) {
    const { titleUUID, thumbnail } = payload;

    const setThumbnailDTO = new SetTitleThumbnailDTO();
    setThumbnailDTO.titleUUID = titleUUID;
    setThumbnailDTO.thumbnail = thumbnail;

    await this.setThumbnail(setThumbnailDTO);
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
