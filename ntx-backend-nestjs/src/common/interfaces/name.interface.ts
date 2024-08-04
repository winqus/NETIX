import { NameCategory } from '@ntx/titles/interfaces/nameCategory.enum';

export interface Name {
  value: string;
  type: NameCategory;
  language: string;
}
