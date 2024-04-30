import FullUploadVideoJobDTO from '../dto/FullUploadVideoJobDTO';
import { IFullUploadVideoJobPersistance, IUploadVideoJobPersistence } from '../persistence/schemas/UploadVideoJob.model';

export default class UploadVideoJobMapper {
  public static fullPersistanceToDTO(persistance: IUploadVideoJobPersistence): FullUploadVideoJobDTO {
    const fullPersistance = persistance as IFullUploadVideoJobPersistance;
    if (!('_id' in fullPersistance.uploadID)) {
      throw new Error(`Upload Video Job does not have _id in uploadID`);
    }

    const video = fullPersistance.uploadID.videoID;
    const metadata = fullPersistance.uploadID.metadataID;
    const thumbnail = fullPersistance.uploadID.thumbnailID;

    const dto: FullUploadVideoJobDTO = {
      uuid: fullPersistance._id,
      createdAt: fullPersistance.createdAt,
      updatedAt: fullPersistance.updatedAt,
      upload: {
        uuid: fullPersistance.uploadID._id,
        createdAt: fullPersistance.uploadID.createdAt,
        updatedAt: fullPersistance.uploadID.updatedAt,
        uploaderID: fullPersistance.uploadID.uploaderID,
        ready: fullPersistance.uploadID.ready,
        state: fullPersistance.uploadID.state,
        video: {
          uuid: video._id,
          createdAt: video.createdAt,
          updatedAt: video.updatedAt,
          lengthInSeconds: video.lengthInSeconds,
          sizeInBytes: video.sizeInBytes,
          ready: video.ready,
          state: video.state,
        },
        metadata: {
          uuid: metadata._id,
          createdAt: metadata.createdAt,
          updatedAt: metadata.updatedAt,
          title: metadata.title,
          publishDatetime: metadata.publishDatetime,
          ready: metadata.ready,
          state: metadata.state,
        },
        thumbnail: {
          uuid: thumbnail._id,
          createdAt: thumbnail.createdAt,
          updatedAt: thumbnail.updatedAt,
          mimeType: thumbnail.mimeType,
          ready: thumbnail.ready,
          state: thumbnail.state,
        },
      },
      chunks: fullPersistance.chunks,
      chunksReceived: fullPersistance.chunksReceived,
      totalChunkCount: fullPersistance.totalChunkCount,
      rawFileSizeInBytes: fullPersistance.rawFileSizeInBytes,
      originalFileName: fullPersistance.originalFileName,
      uploadFileProgressPercentage: fullPersistance.uploadFileProgressPercentage,
      uploadFileDone: fullPersistance.uploadFileDone,
      transcodingProgressPercentage: fullPersistance.transcodingProgressPercentage,
      transcodingDone: fullPersistance.transcodingDone,
      transcodingRate: fullPersistance.transcodingRate,
    };

    return dto;
  }
}
