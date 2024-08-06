import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { NtxEvent } from '@ntx/common/events';
import SeriesCreatedFromExternalSourceEvent from '@ntx/common/events/SeriesCreatedFromExternalSourceEvent';
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { Result } from '@ntx/common/Result';
import { ImportedInformationService } from '@ntx/external-search/imported-information.service';
import { TitleDetailedSearchResult } from '@ntx/external-search/interfaces/TitleDetailedSearchResult.interface';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';
import VideoProcessedEvent from '@ntx/videos/events/VideoProcessedEvent';
import { VIDEO_PROCESSED_EVENT } from '@ntx/videos/videos.constants';
import { validateOrReject } from 'class-validator';
import { NameCategory } from '../interfaces/nameCategory.enum';
import { CreateSeriesTitleDTO } from './dto/CreateSeriesTitle.dto';
import { SeriesTitle } from './interfaces/seriesTitle.interface';
import { SeriesRepository } from './series.repository';

@Injectable()
export class SeriesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    private readonly repository: SeriesRepository,
    private readonly extInfoService: ImportedInformationService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  public async create(createDTO: CreateSeriesTitleDTO): Promise<Result<SeriesTitle>> {
    try {
      await validateOrReject(createDTO);

      const title: SeriesTitle = {
        uuid: generateUUIDv4(),
        createdAt: new Date(),
        updatedAt: new Date(),
        thumbnail: undefined,
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

  public async createFromExternalSource(externalTitle: TitleDetailedSearchResult): Promise<Result<SeriesTitle>> {
    try {
      if (externalTitle.id == null || externalTitle.sourceUUID == null) {
        this.logger.error('No external source or id provided as args');

        return Result.fail('No external source or id');
      }

      const isAlreadyImported = (
        await this.extInfoService.isAlreadyImported(externalTitle.sourceUUID, externalTitle.id, TitleType.SERIES)
      ).getValue();

      if (isAlreadyImported) {
        return Result.fail(
          `${externalTitle.type} title (${externalTitle.id}) from source (${externalTitle.sourceUUID}) already exists`,
        );
      }

      const createDTO = new CreateSeriesTitleDTO();
      createDTO.names = [
        {
          type: NameCategory.Primary,
          value: externalTitle.title,
          language: '',
        },
      ];
      createDTO.releaseDate = new Date(externalTitle.releaseDate);

      const result = await this.create(createDTO);

      if (result.isFailure) {
        return result;
      }

      const createdSeries = result.getValue();

      this.eventEmitter.emit(
        NtxEvent.SeriesCreatedFromExternalSource,
        new SeriesCreatedFromExternalSourceEvent(createdSeries, externalTitle),
      );

      return Result.ok(createdSeries);
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
