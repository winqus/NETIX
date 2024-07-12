export enum ContentType {
  MOVIE = 'MOVIE',
  SERIES = 'SERIES',
}

export default interface MetadataDTO {
  id: string;
  title: string;
  originalTitle: string;
  type: ContentType;
  weights: string;
  releaseDate: Date;
  sourceUUID: string;
}
