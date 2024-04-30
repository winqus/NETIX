import UniqueEntityID from '../core/entities/UniqueEntityID';
import Upload from '../core/entities/Upload';
import { IUploadPersistence, IUploadPersistenceFullyPopulated } from '../persistence/schemas/Upload.model';
import { IVideoPersistence } from '../persistence/schemas/Video.model';
import MetadataMapper from './MetadataMapper';
import ThumbnailMapper from './ThumbnailMapper';
import VideoMapper from './VideoMapper';

export default class UploadMapper {
  public static entityToPersistance(entity: Upload): IUploadPersistence {
    return {
      _id: entity.uuid.toString(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      uploaderID: entity.uploaderID.toString(),
      videoID: entity.video.uuid.toString(),
      metadataID: entity.metadata.uuid.toString(),
      thumbnailID: entity.thumbnail.uuid.toString(),
      ready: entity.ready,
      state: entity.state,
    };
  }

  public static fullyPopulatedPersistanceToEntity(persistance: IUploadPersistenceFullyPopulated): Upload {
    const entity = Upload.create(
      {
        uploaderID: persistance.uploaderID,
        video: VideoMapper.persistanceToEntity(persistance.video as IVideoPersistence),
        thumbnail: ThumbnailMapper.persistanceToEntity(persistance.thumbnail),
        metadata: MetadataMapper.persistanceToEntity(persistance.metadata),
        state: persistance.state,
      },
      new UniqueEntityID(persistance._id),
      persistance.createdAt,
      persistance.updatedAt
    );

    return entity.getValue();
  }
}
