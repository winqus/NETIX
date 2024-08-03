import { Entity } from '@ntx/common/interfaces/entity.interface';

export interface ImportedInformation extends Entity {
  sourceUUID: string;
  externalEntityID: string;
  providedForEntity: string;
  details: any;
}
