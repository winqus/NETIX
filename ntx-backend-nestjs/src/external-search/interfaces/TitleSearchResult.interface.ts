import { TitleType } from '@ntx/common/interfaces/TitleType.enum';

export interface TitleSearchResult {
  title: string;
  originalTitle: string;
  id: string;
  type: TitleType;
  weight: number;
  releaseDate: string;
  sourceUUID: string;
}
