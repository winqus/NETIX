import FullUploadVideoJobDTO from '../dto/FullUploadVideoJobDTO';
import { IFullUploadVideoJobPersistance } from '../persistence/schemas/UploadVideoJob.model';
import { UploadMapper } from './UploadMapper';

export default class UploadVideoJobMapper {
  public static fullPersistanceToDTO(persistance: IFullUploadVideoJobPersistance): FullUploadVideoJobDTO {
    if (!('_id' in persistance.uploadID)) {
      throw new Error(`Upload Video Job does not have _id in uploadID`);
    }

    const upload = persistance.uploadID;

    const dto: FullUploadVideoJobDTO = {
      uuid: persistance._id,
      createdAt: persistance.createdAt,
      updatedAt: persistance.updatedAt,
      upload: UploadMapper.fullPersistenceToDTO(upload),
      chunks: persistance.chunks,
      chunksReceived: persistance.chunksReceived,
      totalChunkCount: persistance.totalChunkCount,
      rawFileSizeInBytes: persistance.rawFileSizeInBytes,
      originalFileName: persistance.originalFileName,
      uploadFileProgressPercentage: persistance.uploadFileProgressPercentage,
      uploadFileDone: persistance.uploadFileDone,
      transcodingProgressPercentage: persistance.transcodingProgressPercentage,
      transcodingDone: persistance.transcodingDone,
      transcodingRate: persistance.transcodingRate,
    };

    return dto;
  }
}
