import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Body,
  Controller,
  HttpException,
  Inject,
  Logger,
  NotFoundException,
  Post,
  UseGuards,
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
import { TitleType } from '@ntx/common/interfaces/TitleType.enum';
import { SimpleValidationPipe } from '@ntx/common/pipes/simple-validation.pipe';
import { ExternalTitleService } from '@ntx/external-providers/external-title.service';
import { validateOrReject } from 'class-validator';
import { CreateMovieDTO } from './dto/create-movie.dto';
import { ImportMovieDTO } from './dto/import-movie.dto';
import { MovieDTO } from './dto/movie.dto';
import { MovieCreatedEvent, MovieEvent } from './events/movies.events';
import {
  MOVIES_CACHE_KEY,
  MOVIES_IMPORT_CONTROLLER_BASE_PATH,
  MOVIES_IMPORT_CONTROLLER_VERSION,
  MOVIES_SWAGGER_TAG,
} from './movies.constants';
import { MoviesService } from './movies.service';
import { ApiDocsForImportMovie } from './swagger/api-docs.decorators';

@ApiTags(MOVIES_SWAGGER_TAG)
@Controller({
  path: MOVIES_IMPORT_CONTROLLER_BASE_PATH,
  version: MOVIES_IMPORT_CONTROLLER_VERSION,
})
@UsePipes(new SimpleValidationPipe())
export class MoviesImportController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly moviesSrv: MoviesService,
    private readonly externalTitles: ExternalTitleService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  @UseGuards(AuthenticationGuard, PermissionGuard)
  @HasPermission(Permission.ImportTitle)
  @ApiDocsForImportMovie()
  public async import(@Body() dto: ImportMovieDTO, @CurrentUser() user: User): Promise<MovieDTO> {
    try {
      await validateOrReject(dto);

      const externalTitleMetadata = await this.externalTitles.getTitleMetadata({
        providerID: dto.externalProviderID,
        externalID: dto.externalID,
        type: TitleType.MOVIE,
      });

      if (externalTitleMetadata == null) {
        throw new NotFoundException('External title not found');
      }

      const createMovieDTO = new CreateMovieDTO();
      createMovieDTO.name = externalTitleMetadata.metadata.name;
      createMovieDTO.originallyReleasedAt = new Date(externalTitleMetadata.metadata.releaseDate);
      createMovieDTO.summary = externalTitleMetadata.metadata.summary;
      createMovieDTO.runtimeMinutes = externalTitleMetadata.metadata.runtime;

      const newMovie = await this.moviesSrv.createOne(createMovieDTO);

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

  private async clearMoviesCache() {
    this.cache.del(MOVIES_CACHE_KEY.GET_ALL);
  }
}
