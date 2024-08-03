import { Injectable, Logger } from '@nestjs/common';
import { Result } from '@ntx/common/Result';
import { ImportedInformationRepository } from './imported-information.repository';
import { ImportedInformation } from './interfaces/ImportedInformation.interface';

@Injectable()
export class ImportedInformationService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly importedInfoRepository: ImportedInformationRepository) {}

  public async isAlreadyImported(externalSourceUUID: string, externalEntityID: string): Promise<Result<boolean>> {
    try {
      if (externalSourceUUID == null || externalSourceUUID.length === 0) {
        return Result.fail('External source UUID is required');
      } else if (externalEntityID == null || externalEntityID.length === 0) {
        return Result.fail('External entity ID is required');
      }

      const exists = await this.importedInfoRepository.exists({
        sourceUUID: externalSourceUUID,
        externalEntityID: externalEntityID,
      });

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
      });

      return Result.ok(newImportedInfo);
    } catch (error) {
      this.logger.error(error);

      throw error;
    }
  }
}
