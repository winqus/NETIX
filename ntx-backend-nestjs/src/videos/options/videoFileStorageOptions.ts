import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { generateTempFileName } from '@ntx/utility/fileNameUtils';
import { diskStorage } from 'multer';
import { extname } from 'path/posix';
import { ensureNoTrailingSlash } from '../../utility/filePathUtils';
import multerFileMimeTypeFilter from '../../utility/multerFileMimeTypeFilter';
import { VIDEO_FILE, VIDEO_TEMP_DIR } from '../videos.constants';

export const videoFileStorageOptions: MulterOptions = {
  storage: diskStorage({
    destination: ensureNoTrailingSlash(VIDEO_TEMP_DIR),
    filename: (_req, file, callback) => {
      const fileName = generateTempFileName({ prefix: file.fieldname, ext: extname(file.originalname) });
      callback(null, fileName);
    },
  }),
  limits: {
    fileSize: VIDEO_FILE.MAX_FILE_SIZE,
  },
  fileFilter: multerFileMimeTypeFilter(VIDEO_FILE.INPUT_MIME_TYPES),
};
