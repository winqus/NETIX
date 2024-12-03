import { VideoDTO, VideoRequirementDTO, VideoState } from '../models/video.dto';

export class VideoRequirementDTOMapper {
  static anyToVideoRequirementDTO(item: any): VideoRequirementDTO {
    return {
      supportedMimeTypes: item.supportedMimeTypes,
      allowedExtensions: item.allowedExtensions,
      maxFileSizeInBytes: item.maxFileSizeInBytes,
    };
  }
}

export class VideoDTOMapper {
  static anyToVideoDTO(item: any): VideoDTO {
    return {
      id: item.id,
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt),
      name: item.name,
      state: item.state as VideoState,
    };
  }
}
