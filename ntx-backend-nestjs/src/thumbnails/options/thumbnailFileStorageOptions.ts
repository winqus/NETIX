import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path/posix';
import { THUMBNAIL_FILE, THUMBNAIL_TEMP_DIR } from '../thumbnails.constants';
import multerFileMimeTypeFilter from '../utility/multerFileMimeTypeFilter';

export const thumbnailFileStorageOptions: MulterOptions = {
  storage: diskStorage({
    destination: THUMBNAIL_TEMP_DIR,
    filename: (_req, file, callback) => {
      const fileName = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${file.fieldname}-${fileName}${ext}`);
    },
  }),
  limits: {
    fileSize: THUMBNAIL_FILE.MAX_FILE_SIZE,
  },
  fileFilter: multerFileMimeTypeFilter(THUMBNAIL_FILE.INPUT_MIME_TYPES),
};
