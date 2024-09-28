import { TitleType } from '@ntx/common/interfaces/TitleType.enum';

export interface TitleResultShortMetadata {
  title: string;
  type: TitleType;
  releaseDate: string;
  posterID?: string;
}
