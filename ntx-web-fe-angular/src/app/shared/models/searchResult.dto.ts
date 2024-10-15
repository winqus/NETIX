import { TitleType } from './titleType.enum';

export interface SearchResultDTO {
  id: string | null;
  name: string;
  type: TitleType.MOVIE;
  posterURL?: string;
  year: number;
  provider: string | null;
  item: any;
}
