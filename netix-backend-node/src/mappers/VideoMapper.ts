import UniqueEntityID from '../core/entities/UniqueEntityID';
import Video from '../core/entities/Video';
import { IVideoPersistence } from '../persistence/schemas/Video.model';

export default class VideoMapper {
  public static entityToPersistance(entity: Video): IVideoPersistence {
    return {
      _id: entity.uuid.toString(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lengthInSeconds: entity.lengthInSeconds,
      sizeInBytes: entity.sizeInBytes,
      ready: entity.ready,
      state: entity.state,
    };
  }

  public static persistanceToEntity(persistance: IVideoPersistence): Video {
    const entity = Video.create(
      {
        lengthInSeconds: persistance.lengthInSeconds,
        sizeInBytes: persistance.sizeInBytes,
        state: persistance.state,
      },
      new UniqueEntityID(persistance._id),
      persistance.createdAt,
      persistance.updatedAt
    );

    return entity.getValue();
  }
}
