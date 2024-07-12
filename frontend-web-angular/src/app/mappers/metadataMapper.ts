import MetadataDTO from '../models/metadata.dto';
import { ContentType } from '../models/metadata.dto';

export class MetadataDTOMapper {
  static toMetadataItem(item: any): MetadataDTO {
    return {
      id: item.id,
      title: item.title,
      originalTitle: item.originalTitle,
      type: ContentType[item.type as keyof typeof ContentType],
      weights: item.weights,
      releaseDate: new Date(item.releaseDate),
      sourceUUID: item.sourceUUID,
    };
  }
}
