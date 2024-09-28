import { TitleType } from '@ntx/common/interfaces/TitleType.enum';

export interface TitleResultMetadata {
  title: string;
  originalTitle: string;
  summary: string;
  type: TitleType;
  releaseDate: string;
  posterURL?: string;
  backdropURL?: string;
}
