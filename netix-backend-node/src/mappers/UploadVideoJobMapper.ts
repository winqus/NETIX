import UniqueEntityID from '../core/entities/UniqueEntityID';
import UploadVideoJob from '../core/entities/UploadVideoJob';
import { IUploadVideoJobPersistence } from '../persistence/schemas/UploadVideoJob.model';

export default class UploadVideoJobMapper {
  public static entityToPersistance(entity: UploadVideoJob): IUploadVideoJobPersistence {
    return {
      _id: entity.uuid.toString(),
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      uploadID: entity.uploadID.toString(),
      chunks: entity.chunks,
      chunksReceived: entity.chunksReceived,
      totalChunkCount: entity.totalChunkCount,
      rawFileSizeInBytes: entity.rawFileSizeInBytes,
      originalFileName: entity.originalFileName,
      uploadFileProgressPercentage: entity.uploadFileProgressPercentage,
      uploadFileDone: entity.uploadFileDone,
      transcodingProgressPercentage: entity.transcodingProgressPercentage,
      transcodingDone: entity.transcodingDone,
      transcodingRate: entity.transcodingRate,
    };
  }

  public static persistanceToEntity(persistance: IUploadVideoJobPersistence): UploadVideoJob {
    const entity = UploadVideoJob.create(
      {
        uploadID: new UniqueEntityID(persistance.uploadID as string),
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
      },
      new UniqueEntityID(persistance._id),
      persistance.createdAt,
      persistance.updatedAt
    );

    return entity.getValue();
  }
}
