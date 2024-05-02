import UploadDTO from '../dto/UploadDTO';
import WatchableVideoDTO from '../dto/WatchableVideoDTO';
import { IFullUploadPersistance } from '../persistence/schemas/UploadVideoJob.model';
import { MetadataMapper } from './MetadataMapper';
import { ThumbnailMapper } from './ThumbnailMapper';
import { VideoMapper } from './VideoMapper';

export class UploadMapper {
  public static fullPersistenceToDTO(persistence: IFullUploadPersistance): UploadDTO {
    if (!('_id' in persistence.videoID)) {
      throw new Error(`Upload Video Job does not have _id in uploadID`);
    }

    if (!('_id' in persistence.metadataID)) {
      throw new Error(`Upload Video Job does not have _id in uploadID`);
    }

    if (!('_id' in persistence.thumbnailID)) {
      throw new Error(`Upload Video Job does not have _id in uploadID`);
    }

    return {
      uuid: persistence._id,
      createdAt: persistence.createdAt,
      updatedAt: persistence.updatedAt,
      uploaderID: persistence.uploaderID,
      ready: persistence.ready,
      state: persistence.state,
      video: VideoMapper.persistenceToDTO(persistence.videoID),
      metadata: MetadataMapper.persistenceToDTO(persistence.metadataID),
      thumbnail: ThumbnailMapper.persistenceToDTO(persistence.thumbnailID),
    };
  }

  public static UploadDTO_to_WatchableVideoDTO(uploadDTO: UploadDTO): WatchableVideoDTO {
    const newDto: WatchableVideoDTO = {
      uploadID: uploadDTO.uuid,
      uploaderID: uploadDTO.uploaderID,
      createdDateTime: uploadDTO.createdAt,
      uploadedDateTime: uploadDTO.updatedAt,
      state: uploadDTO.video.state,
      ready: uploadDTO.ready,
      thumbnail: {
        createdDateTime: uploadDTO.thumbnail.createdAt,
        updatedDateTime: uploadDTO.thumbnail.updatedAt,
        thumbnailID: uploadDTO.thumbnail.uuid,
        mimeType: uploadDTO.thumbnail.mimeType,
      },
      metadata: {
        createdDateTime: uploadDTO.metadata.createdAt,
        updatedDateTime: uploadDTO.metadata.updatedAt,
        description: {
          title: uploadDTO.metadata.title,
          publishDatetime: uploadDTO.metadata.publishDatetime,
        },
      },
    };

    return newDto;
  }
}
