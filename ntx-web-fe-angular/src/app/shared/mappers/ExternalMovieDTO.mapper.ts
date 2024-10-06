import { ExternalMovieDTO, ExternalMovieMetadata } from '../models/externalMovie.dto';
import { TitleType } from '../models/titleType.enum';

export class ExternalMovieDTOMapper {
  static anyToExternalMovieDTO(item: any): ExternalMovieDTO {
    return {
      externalID: item.externalID,
      providerID: item.providerID,
      type: item.type as TitleType,
      metadata: this.anyToExternalMovieMetadata(item.metadata),
      posterURL: item.posterURL || null,
      backdropURL: item.backdropURL || null,
    };
  }

  static anyToExternalMovieMetadata(item: any): ExternalMovieMetadata {
    return {
      name: item.name,
      originalName: item.originalName,
      summary: item.summary,
      releaseDate: item.releaseDate,
      runtime: item.runtime,
    };
  }
}
