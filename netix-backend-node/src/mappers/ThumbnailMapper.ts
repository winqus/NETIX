import Thumbnail from '../core/entities/Thumbnail';
import UniqueEntityID from '../core/entities/UniqueEntityID';
import { IThumbnailPersistence } from '../persistence/schemas/Thumbnail.model';

export default class ThumbnailMapper {
  public static entityToPersistance(entity: Thumbnail): IThumbnailPersistence {
    return {
      _id: entity.uuid.toString(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      mimeType: entity.mimeType,
      ready: entity.ready,
      state: entity.state,
    };
  }

  public static persistanceToEntity(persistance: IThumbnailPersistence): Thumbnail {
    const entity = Thumbnail.create(
      {
        mimeType: persistance.mimeType,
        state: persistance.state,
      },
      new UniqueEntityID(persistance._id),
      persistance.createdAt,
      persistance.updatedAt
    );

    return entity.getValue();
  }
}
