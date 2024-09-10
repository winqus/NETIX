import { NameCategory } from '@ntx/titles-legacy/interfaces/nameCategory.enum';

export interface Name {
  value: string;
  type: NameCategory;
  language: string;
}
