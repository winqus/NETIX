import MetadataDTO from '../dto/MetadataDTO';
import { IMetadataPersistence } from '../persistence/schemas/Metadata.model';

export class MetadataMapper {
  public static persistenceToDTO(persistence: IMetadataPersistence): MetadataDTO {
    return {
      uuid: persistence._id,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
      title: persistence.title,
      publishDatetime: persistence.publishDatetime,
      ready: persistence.ready,
      state: persistence.state,
    };
  }
}
