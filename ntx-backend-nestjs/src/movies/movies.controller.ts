import { Cache, CACHE_MANAGER, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { SimpleValidationPipe } from '@ntx/common/pipes/simple-validation.pipe';
import { fileInStorageFromRaw } from '@ntx/file-storage/factories/file-in-store-from-raw.factory';
import { FileToStorageContainerInterceptor } from '@ntx/file-storage/interceptors/file-to-storage-container.interceptor';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { MovieDTO } from './dto/movie.dto';
import { UpdateMovieDTO } from './dto/update-movie.dto';
import {
  MOVIES_CACHE_KEY,
  MOVIES_CACHE_OPTS,
  MOVIES_CONTROLLER_BASE_PATH,
  MOVIES_CONTROLLER_VERSION,
  MOVIES_EMPTY_DTO_ERROR,
  MOVIES_NO_FILE_PROVIDED_ERROR,
  MOVIES_NO_ID_PROVIDED_ERROR,
  MOVIES_NOT_FOUND_ERROR,
  MOVIES_POSTER_STORAGE_ARGS as MOVIES_POSTER_FILE_STORAGE_ARGS,
  MOVIES_SWAGGER_TAG,
} from './movies.constants';
import { MoviesService } from './movies.service';
import {
  ApiDocsForDeleteMoviePublished,
  ApiDocsForGetMovie,
  ApiDocsForGetMovies,
  ApiDocsForPatchMovie,
  ApiDocsForPostMovie,
  ApiDocsForPutMoviePublished,
  ApiDocsForPutUpdatePoster,
} from './swagger/api-docs.decorators';

@ApiTags(MOVIES_SWAGGER_TAG)
@Controller({
  path: MOVIES_CONTROLLER_BASE_PATH,
  version: MOVIES_CONTROLLER_VERSION,
})
@UsePipes(new SimpleValidationPipe())
export class MoviesController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly moviesSrv: MoviesService,
  ) {}

  @Post()
  @ApiDocsForPostMovie()
  @UseInterceptors(FileToStorageContainerInterceptor(MOVIES_POSTER_FILE_STORAGE_ARGS))
  public async create(@UploadedFile() file: Express.Multer.File, @Body() dto: CreateMovieDTO): Promise<MovieDTO> {
    try {
      if (file == null) {
        throw new BadRequestException(MOVIES_NO_FILE_PROVIDED_ERROR);
      }

      await validateOrReject(dto);

      const newMovie = await this.moviesSrv.createOneWithPoster(dto, fileInStorageFromRaw(file));

      this.logger.log(`Created new movie ${newMovie.id} with poster ${newMovie.posterID}`);

      this.clearMoviesCache();

      return newMovie;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }

  @Get(':id')
  @ApiDocsForGetMovie()
  public async get(@Param('id') id: string): Promise<MovieDTO> {
    try {
      if (!id) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      const movie = await this.moviesSrv.findOne(id);

      return movie;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey(MOVIES_CACHE_KEY.GET_ALL)
  @CacheTTL(MOVIES_CACHE_OPTS[MOVIES_CACHE_KEY.GET_ALL].ttl)
  @ApiDocsForGetMovies()
  public async getAll(): Promise<MovieDTO[]> {
    try {
      const movies = await this.moviesSrv.findAll();

      this.logger.log(`Fetched all movies`);

      return movies;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }

  @Put(':id/poster')
  @ApiDocsForPutUpdatePoster()
  @UseInterceptors(FileToStorageContainerInterceptor(MOVIES_POSTER_FILE_STORAGE_ARGS))
  public async updatePoster(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    try {
      if (!id) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      if (file == null) {
        throw new BadRequestException(MOVIES_NO_FILE_PROVIDED_ERROR);
      }

      const updatedMovie = await this.moviesSrv.updatePosterForOne(id, fileInStorageFromRaw(file));

      this.logger.log(`Updated poster for movie ${id}`);

      this.clearMoviesCache();

      return updatedMovie;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }

  @Patch(':id')
  @ApiDocsForPatchMovie()
  public async update(@Param('id') id: string, @Body() dto: UpdateMovieDTO) {
    try {
      if (!id) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      if (!dto || Object.keys(dto).length === 0) {
        throw new BadRequestException(MOVIES_EMPTY_DTO_ERROR);
      }

      await validateOrReject(dto);

      const updatedMovie = await this.moviesSrv.updateOne(id, dto);

      if (updatedMovie == null) {
        throw new NotFoundException(MOVIES_NOT_FOUND_ERROR);
      }

      this.logger.log(`Updated movie ${id}`);

      this.clearMoviesCache();

      return updatedMovie;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }

  @Put(':id/published')
  @ApiDocsForPutMoviePublished()
  public async publish(@Param('id') id: string): Promise<MovieDTO> {
    try {
      const updatedMovie = await this.moviesSrv.publishOne(id);

      this.logger.log(`Published movie ${id}`);

      this.clearMoviesCache();

      return updatedMovie;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }

  @Delete(':id/published')
  @ApiDocsForDeleteMoviePublished()
  public async unpublish(@Param('id') id: string): Promise<MovieDTO> {
    try {
      const updatedMovie = await this.moviesSrv.unpublishOne(id);

      this.logger.log(`Unpublished movie ${id}`);

      this.clearMoviesCache();

      return updatedMovie;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }

  private async clearMoviesCache() {
    this.cache.del(MOVIES_CACHE_KEY.GET_ALL);
  }
}
