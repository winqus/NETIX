import { VideoRequirementDTO } from '../models/video.dto';

export class VideoRequirementDTOMapper {
  static anyToVideoRequirementDTO(item: any): VideoRequirementDTO {
    return {
      supportedMimeTypes: item.supportedMimeTypes,
      allowedExtentions: item.allowedExtentions,
      maxFileSizeInBytes: item.maxFileSizeInBytes,
    };
  }
}
