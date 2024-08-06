import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NtxEvent } from '@ntx/common/events';
import MovieCreatedFromExternalSourceEvent from '@ntx/common/events/MovieCreatedFromExternalSourceEvent';
import SeriesCreatedFromExternalSourceEvent from '@ntx/common/events/SeriesCreatedFromExternalSourceEvent';
import TitleCreatedFromExternalSourceEvent from '@ntx/common/events/TitleCreatedFromExternalSourceEvent';
import { Result } from '@ntx/common/Result';
import { ImportedInformationRepository } from './imported-information.repository';
import { ImportedInformation } from './interfaces/ImportedInformation.interface';

@Injectable()
export class ImportedInformationService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly importedInfoRepository: ImportedInformationRepository) {}

  public async isAlreadyImported(
    externalSourceUUID: string,
    externalEntityID: string,
    tag?: string,
  ): Promise<Result<boolean>> {
    try {
      if (externalSourceUUID == null || externalSourceUUID.length === 0) {
        return Result.fail('External source UUID is required');
      } else if (externalEntityID == null || externalEntityID.length === 0) {
        return Result.fail('External entity ID is required');
      }
      const filter: any = {
        sourceUUID: externalSourceUUID,
        externalEntityID: externalEntityID,
      };
      if (typeof tag === 'string' && tag.length > 0) {
        filter.tag = tag;
      }

      const exists = await this.importedInfoRepository.exists(filter);

      return Result.ok(exists);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  public async registerImportedInformation(
    sourceUUID: string,
    externalEntityID: string,
    providedForEntity: string,
    details: any,
    tag?: string,
  ): Promise<Result<ImportedInformation>> {
    try {
      if (sourceUUID == null || sourceUUID.length === 0) {
        return Result.fail('External source UUID is required');
      } else if (externalEntityID == null || externalEntityID.length === 0) {
        return Result.fail('External entity ID is required');
      } else if (providedForEntity == null || providedForEntity.length === 0) {
        return Result.fail('Provided for entity is required');
      }

      const newImportedInfo = await this.importedInfoRepository.create({
        sourceUUID: sourceUUID,
        externalEntityID: externalEntityID,
        providedForEntity: providedForEntity,
        details: details,
        tag: tag || null,
      });

      return Result.ok(newImportedInfo);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }

  @OnEvent(NtxEvent.TitleCreatedFromExternalSource)
  @OnEvent(NtxEvent.MovieCreatedFromExternalSource)
  @OnEvent(NtxEvent.SeriesCreatedFromExternalSource)
  private async handleTitleCreateFromExternalSource(
    payload:
      | TitleCreatedFromExternalSourceEvent
      | MovieCreatedFromExternalSourceEvent
      | SeriesCreatedFromExternalSourceEvent,
  ) {
    const { createdTitle, externalTitle } = payload;
    if (createdTitle == null || externalTitle == null) {
      this.logger.error('No payload provided');

      return;
    }

    const sourceUUID = externalTitle.sourceUUID;
    const extEntityID = externalTitle.id;
    const titleUUID = createdTitle.uuid;
    const infoTag = createdTitle.type || null;

    this.registerImportedInformation(sourceUUID, extEntityID, titleUUID, externalTitle, infoTag)
      .then((result) => {
        const value = result.getValue();
        if (result.isSuccess) {
          this.logger.log(`Registered imported ${createdTitle.type} from ${value.sourceUUID} (${value.uuid})`);
        } else {
          this.logger.error(
            `Failed to register ${createdTitle.type} ${value.providedForEntity} from ${value.sourceUUID}`,
          );
        }
      })
      .catch((error) => {
        this.logger.error(`Failed to register ${createdTitle.type} title`, error);
      });
  }
}
