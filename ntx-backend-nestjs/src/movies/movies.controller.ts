import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { SimpleValidationPipe } from '@ntx/common/pipes/simple-validation.pipe';
import { fileInStorageFromRaw } from '@ntx/file-storage/factories/file-in-store-from-raw.factory';
import { FileToStorageContainerInterceptor } from '@ntx/file-storage/interceptors/file-to-storage-container.interceptor';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { MovieDTO } from './dto/movie.dto';
import {
  MOVIES_CONTROLLER_BASE_PATH,
  MOVIES_CONTROLLER_VERSION,
  MOVIES_NO_FILE_PROVIDED_ERROR,
  MOVIES_POSTER_STORAGE_ARGS as MOVIES_POSTER_FILE_STORAGE_ARGS,
} from './movies.constants';
import { MoviesService } from './movies.service';

@Controller({
  path: MOVIES_CONTROLLER_BASE_PATH,
  version: MOVIES_CONTROLLER_VERSION,
})
@UsePipes(new SimpleValidationPipe())
export class MoviesController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly moviesSrv: MoviesService) {}

  @Post()
  @UseInterceptors(FileToStorageContainerInterceptor(MOVIES_POSTER_FILE_STORAGE_ARGS))
  public async create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateMovieDTO): Promise<MovieDTO> {
    try {
      if (file == null) {
        throw new BadRequestException(MOVIES_NO_FILE_PROVIDED_ERROR);
      }

      await validateOrReject(dto);

      const newMovie = await this.moviesSrv.createMovie(dto, fileInStorageFromRaw(file));

      this.logger.log(`Created new movie ${newMovie.id} with poster ${newMovie.posterID}`);

      return newMovie;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }
}
