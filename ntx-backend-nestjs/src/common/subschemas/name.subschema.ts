import { NameCategory } from '@ntx/titles/interfaces/nameCategory.enum';

export const NameSubschema = {
  type: {
    type: String,
    enum: Object.values(NameCategory),
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    default: null,
  },
};
