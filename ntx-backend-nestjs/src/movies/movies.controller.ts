import { Controller, HttpException, Logger, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express/multer';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/CreateMovieDTO';
import { MovieDTO } from './dto/MovieDTO';
import {
  MOVIES_CONTROLLER_BASE_PATH,
  MOVIES_CONTROLLER_VERSION,
  MOVIES_POSTER_FILE_FIELD_NAME,
} from './movies.constants';
import { MoviesService } from './movies.service';
import { tempImageFileStorageMulterOptions } from './options/tempImageFileStorageMulterOptions';

@Controller({
  path: MOVIES_CONTROLLER_BASE_PATH,
  version: MOVIES_CONTROLLER_VERSION,
})
export class MoviesController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly moviesSrv: MoviesService) {}

  @Post()
  @UseInterceptors(FileInterceptor(MOVIES_POSTER_FILE_FIELD_NAME, tempImageFileStorageMulterOptions))
  public async create(@UploadedFile() file: Express.Multer.File, dto: CreateMovieDTO): Promise<MovieDTO> {
    try {
      await validateOrReject(dto);

      return this.moviesSrv.createMovieManually(dto, file.path);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }
}
