import { Inject, Injectable } from '@nestjs/common';
import { EntityRepository } from '@ntx/database/entity.repository';
import { Document, Model } from 'mongoose';
import { IMPORTED_INFORMATION_MODEL } from './imported-information.constants';
import { ImportedInformation } from './interfaces/ImportedInformation.interface';

@Injectable()
export class ImportedInformationRepository extends EntityRepository<ImportedInformation> {
  constructor(@Inject(IMPORTED_INFORMATION_MODEL) importedInfoModel: Model<ImportedInformation & Document>) {
    super(importedInfoModel);
  }
}
