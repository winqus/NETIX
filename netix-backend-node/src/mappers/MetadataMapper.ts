import Metadata from '../core/entities/Metadata';
import UniqueEntityID from '../core/entities/UniqueEntityID';
import { IMetadataPersistence } from '../persistence/schemas/Metadata.model';

export default class MetadataMapper {
  public static entityToPersistance(entity: Metadata): IMetadataPersistence {
    return {
      _id: entity.uuid.toString(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      title: entity.title,
      publishDatetime: entity.originallyPublishedAt,
      ready: entity.ready,
      state: entity.state,
    };
  }

  public static persistanceToEntity(persistance: IMetadataPersistence): Metadata {
    const entity = Metadata.create(
      {
        title: persistance.title,
        originallyPublishedAt: persistance.publishDatetime,
        state: persistance.state,
      },
      new UniqueEntityID(persistance._id),
      persistance.createdAt,
      persistance.updatedAt
    );

    return entity.getValue();
  }
}
