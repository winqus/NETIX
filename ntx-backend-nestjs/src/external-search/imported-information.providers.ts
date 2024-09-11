import { DATABASE_CONNECTION } from '@ntx/database/database.constants';
import { Mongoose } from 'mongoose';
import { IMPORTED_INFORMATION_MODEL, IMPORTED_INFORMATION_SCHEMA_NAME } from './imported-information.constants';
import { ImportedInformationSchema } from './schemas/importedInformation.schema';

export const importedInformationProviders = [
  {
    provide: IMPORTED_INFORMATION_MODEL,
    useFactory: (mongoose: Mongoose) => mongoose.model(IMPORTED_INFORMATION_SCHEMA_NAME, ImportedInformationSchema),
    inject: [DATABASE_CONNECTION],
  },
];
