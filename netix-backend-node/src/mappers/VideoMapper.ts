import VideoDTO from '../dto/VideoDTO';
import { IVideoPersistence } from '../persistence/schemas/Video.model';

export class VideoMapper {
  public static persistenceToDTO(persistence: IVideoPersistence): VideoDTO {
    return {
      uuid: persistence._id,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
      lengthInSeconds: persistence.lengthInSeconds,
      sizeInBytes: persistence.sizeInBytes,
      ready: persistence.ready,
      state: persistence.state,
    };
  }
}
