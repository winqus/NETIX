import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { generateTempFileName } from '@ntx/utility/fileNameUtils';
import { diskStorage } from 'multer';
import { extname } from 'path/posix';
import multerFileMimeTypeFilter from '../../utility/multerFileMimeTypeFilter';
import { THUMBNAIL_FILE, THUMBNAIL_TEMP_DIR } from '../thumbnails.constants';

export const thumbnailFileStorageOptions: MulterOptions = {
  storage: diskStorage({
    destination: THUMBNAIL_TEMP_DIR,
    filename: (_req, file, callback) => {
      const fileName = generateTempFileName({ prefix: file.fieldname, ext: extname(file.originalname) });
      callback(null, fileName);
    },
  }),
  limits: {
    fileSize: THUMBNAIL_FILE.MAX_FILE_SIZE,
  },
  fileFilter: multerFileMimeTypeFilter(THUMBNAIL_FILE.INPUT_MIME_TYPES),
};
