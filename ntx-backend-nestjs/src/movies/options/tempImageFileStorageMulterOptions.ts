import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { generateTempFileName } from '@ntx/utility/fileNameUtils';
import multerFileMimeTypeFilter from '@ntx/utility/multerFileMimeTypeFilter';
import { diskStorage } from 'multer';
import { extname } from 'path/posix';
import {
  MOVIES_POSTER_INPUT_MIME_TYPES,
  MOVIES_POSTER_MAX_SIZE_IN_BYTES,
  MOVIES_POSTER_TEMP_DIR,
} from '../movies.constants';

export const tempImageFileStorageMulterOptions: MulterOptions = {
  storage: diskStorage({
    destination: MOVIES_POSTER_TEMP_DIR,
    filename: (_req, file, callback) => {
      const fileName = generateTempFileName({ prefix: file.fieldname, ext: extname(file.originalname) });
      callback(null, fileName);
    },
  }),
  limits: {
    fileSize: MOVIES_POSTER_MAX_SIZE_IN_BYTES,
  },
  fileFilter: multerFileMimeTypeFilter(MOVIES_POSTER_INPUT_MIME_TYPES),
};
