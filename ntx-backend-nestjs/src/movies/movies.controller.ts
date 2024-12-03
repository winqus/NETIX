import { Cache, CACHE_MANAGER, CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Head,
  HttpCode,
  HttpException,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ApiTags } from '@nestjs/swagger';
import { HasPermission } from '@ntx/auth/auth.decorators';
import { CurrentUser } from '@ntx/auth/decorators/user.decorator';
import { AuthenticationGuard } from '@ntx/auth/guards/authentication.guard';
import { PermissionGuard } from '@ntx/auth/guards/permission.guard';
import { Permission, User } from '@ntx/auth/user.entity';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { SimpleValidationPipe } from '@ntx/common/pipes/simple-validation.pipe';
import { fileInStorageFromRaw } from '@ntx/file-storage/factories/file-in-store-from-raw.factory';
import { FileToStorageContainerInterceptor } from '@ntx/file-storage/interceptors/file-to-storage-container.interceptor';
import { TusUploadService } from '@ntx/file-storage/tus/tus-upload.service';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { MovieDTO } from './dto/movie.dto';
import { UpdateMovieDTO } from './dto/update-movie.dto';
import {
  MovieBackdropUpdatedEvent,
  MovieCreatedEvent,
  MovieDeletedEvent,
  MovieEvent,
  MoviePosterUpdatedEvent,
  MoviePublishedEvent,
  MovieUnpublishedEvent,
  MovieUpdatedEvent,
} from './events/movies.events';
import {
  MOVIES_BACKDROP_FILE_STORAGE_ARGS,
  MOVIES_CACHE_KEY,
  MOVIES_CACHE_OPTS,
  MOVIES_CONTROLLER_BASE_PATH,
  MOVIES_CONTROLLER_VERSION,
  MOVIES_EMPTY_DTO_ERROR,
  MOVIES_NO_FILE_PROVIDED_ERROR,
  MOVIES_NO_ID_PROVIDED_ERROR,
  MOVIES_NOT_FOUND_ERROR,
  MOVIES_POSTER_FILE_STORAGE_ARGS,
  MOVIES_SWAGGER_TAG,
  MOVIES_VIDEOS_FILE_STORAGE_ARGS,
} from './movies.constants';
import { MoviesService } from './movies.service';
import {
  ApiDocsForDeleteMovie,
  ApiDocsForDeleteMoviePublished,
  ApiDocsForGetMovie,
  ApiDocsForGetMovies,
  ApiDocsForPatchMovie,
  ApiDocsForPostMovie,
  ApiDocsForPutMoviePublished,
  ApiDocsForPutUpdateBackdrop,
  ApiDocsForPutUpdatePoster,
  ApiDocsForTusHeadMovieVideoUpload,
  ApiDocsForTusPatchMovieVideoUpload,
  ApiDocsForTusPostMovieVideoUpload,
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
    private readonly tusUploadSrv: TusUploadService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.CreateTitle)
  @ApiDocsForPostMovie()
  @UseInterceptors(FileToStorageContainerInterceptor(MOVIES_POSTER_FILE_STORAGE_ARGS))
  public async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: CreateMovieDTO,
    @CurrentUser() user: User,
  ): Promise<MovieDTO> {
    try {
      if (file == null) {
        throw new BadRequestException(MOVIES_NO_FILE_PROVIDED_ERROR);
      }

      await validateOrReject(dto);

      const newMovie = await this.moviesSrv.createOneWithPoster(dto, fileInStorageFromRaw(file));

      this.eventEmitter.emit(MovieEvent.Created, new MovieCreatedEvent(newMovie.id, user.id, user.username));

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
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.UpdateTitle)
  @ApiDocsForPutUpdatePoster()
  @UseInterceptors(FileToStorageContainerInterceptor(MOVIES_POSTER_FILE_STORAGE_ARGS))
  public async updatePoster(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<MovieDTO> {
    try {
      if (!id) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      if (file == null) {
        throw new BadRequestException(MOVIES_NO_FILE_PROVIDED_ERROR);
      }

      const updatedMovie = await this.moviesSrv.updatePosterForOne(id, fileInStorageFromRaw(file));

      this.eventEmitter.emit(
        MovieEvent.PosterUpdated,
        new MoviePosterUpdatedEvent(id, updatedMovie.id, user.id, user.username),
      );

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

  @Put(':id/backdrop')
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.UpdateTitle)
  @ApiDocsForPutUpdateBackdrop()
  @UseInterceptors(FileToStorageContainerInterceptor(MOVIES_BACKDROP_FILE_STORAGE_ARGS))
  public async updateBackdrop(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: User,
  ): Promise<MovieDTO> {
    try {
      if (!id) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      if (file == null) {
        throw new BadRequestException(MOVIES_NO_FILE_PROVIDED_ERROR);
      }

      const updatedMovie = await this.moviesSrv.updateBackdropForOne(id, fileInStorageFromRaw(file));

      this.eventEmitter.emit(
        MovieEvent.BackdropUpdated,
        new MovieBackdropUpdatedEvent(id, updatedMovie.backdropID!, user.id, user.username),
      );

      this.logger.log(`Updated backdrop for movie ${id}`);

      return updatedMovie;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }

  @Post(':id/video')
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.UpdateTitle)
  @ApiDocsForTusPostMovieVideoUpload()
  public async handleTusPostToInitUploadVideo(
    @Param('id') id: string,
    @Req() req: any,
    @Res() res: any,
    @CurrentUser() user: User,
  ) {
    await this.moviesSrv.findOne(id);

    this.eventEmitter.emit(MovieEvent.VideoUpdated, new MovieUpdatedEvent(id, { videoID: id }, user.id, user.username));

    await this.tusUploadSrv.handleUpload(MOVIES_VIDEOS_FILE_STORAGE_ARGS, req, res);
  }

  @Head(':id/video/:uploadId')
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.UpdateTitle)
  @ApiDocsForTusHeadMovieVideoUpload()
  public async handleTusHeadToUploadVideo(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    await this.moviesSrv.findOne(id);

    res.set({ 'cache-control': 'no-store' });

    await this.tusUploadSrv.handleUpload(MOVIES_VIDEOS_FILE_STORAGE_ARGS, req, res);
  }

  @Patch(':id/video/:uploadId')
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.UpdateTitle)
  @ApiDocsForTusPatchMovieVideoUpload()
  public async handleTusPatchToUploadVideo(@Param('id') id: string, @Req() req: any, @Res() res: any) {
    try {
      if (!id) {
        throw new BadRequestException(MOVIES_NO_ID_PROVIDED_ERROR);
      }

      const fileInStorage = await this.tusUploadSrv.handleUpload(MOVIES_VIDEOS_FILE_STORAGE_ARGS, req, res);
      if (fileInStorage == null) {
        /* Upload is not yet finished */
        return;
      }

      await this.moviesSrv.updateVideoForOne(id, fileInStorage);

      this.logger.log(
        `video update finished for movie ${id}, file stored ${fileInStorage.fileName} in ${fileInStorage.container}`,
      );

      this.clearMoviesCache();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }

  @Patch(':id')
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.UpdateTitle)
  @ApiDocsForPatchMovie()
  public async update(
    @Param('id') id: string,
    @Body() dto: UpdateMovieDTO,
    @CurrentUser() user: User,
  ): Promise<MovieDTO> {
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

      this.eventEmitter.emit(MovieEvent.Updated, new MovieUpdatedEvent(id, dto, user.id, user.username));

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
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.UpdateTitle)
  @ApiDocsForPutMoviePublished()
  public async publish(@Param('id') id: string, @CurrentUser() user: User): Promise<MovieDTO> {
    try {
      const updatedMovie = await this.moviesSrv.publishOne(id);

      this.logger.log(`Published movie ${id}`);

      this.eventEmitter.emit(MovieEvent.Published, new MoviePublishedEvent(id, user.id, user.username));

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
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.UpdateTitle)
  @ApiDocsForDeleteMoviePublished()
  public async unpublish(@Param('id') id: string, @CurrentUser() user: User): Promise<MovieDTO> {
    try {
      const updatedMovie = await this.moviesSrv.unpublishOne(id);

      this.eventEmitter.emit(MovieEvent.Unpublished, new MovieUnpublishedEvent(id, user.id, user.username));

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

  @Delete(':id')
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.DeleteTitle)
  @HttpCode(204)
  @ApiDocsForDeleteMovie()
  public async delete(@Param('id') id: string, @CurrentUser() user: User): Promise<void> {
    try {
      await this.moviesSrv.deleteOne(id);
      this.eventEmitter.emit(MovieEvent.Deleted, new MovieDeletedEvent(id, user.id, user.username));
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
