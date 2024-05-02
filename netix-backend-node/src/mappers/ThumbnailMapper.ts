import ThumbnailDTO from '../dto/ThumbnailDTO';
import { IThumbnailPersistence } from '../persistence/schemas/Thumbnail.model';

export class ThumbnailMapper {
  public static persistenceToDTO(persistence: IThumbnailPersistence): ThumbnailDTO {
    return {
      uuid: persistence._id,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
      mimeType: persistence.mimeType,
      ready: persistence.ready,
      state: persistence.state,
    };
  }
}
