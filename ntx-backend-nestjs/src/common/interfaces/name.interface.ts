import { NameCategory } from '@ntx/titles/interfaces/nameCategory.enum';

export interface Name {
  name: string;
  type: NameCategory;
  language: string;
}
