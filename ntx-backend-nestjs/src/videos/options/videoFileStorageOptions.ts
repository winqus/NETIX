import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path/posix';
import multerFileMimeTypeFilter from '../../utility/multerFileMimeTypeFilter';
import { VIDEO_FILE, VIDEO_TEMP_DIR } from '../videos.constants';

export const videoFileStorageOptions: MulterOptions = {
  storage: diskStorage({
    destination: VIDEO_TEMP_DIR,
    filename: (_req, file, callback) => {
      const fileName = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname);
      callback(null, `${file.fieldname}-${fileName}${ext}`);
    },
  }),
  limits: {
    fileSize: VIDEO_FILE.MAX_FILE_SIZE,
  },
  fileFilter: multerFileMimeTypeFilter(VIDEO_FILE.INPUT_MIME_TYPES),
};
