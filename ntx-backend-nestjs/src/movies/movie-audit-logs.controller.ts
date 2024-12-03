import { Controller, Get, HttpException, Logger, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { MovieAuditLogsService } from './movie-audit-logs.service';
import { MOVIES_CONTROLLER_BASE_PATH, MOVIES_CONTROLLER_VERSION, MOVIES_SWAGGER_TAG } from './movies.constants';
import { ApiDocsForGetLogs } from './swagger/api-docs.decorators';

@ApiTags(MOVIES_SWAGGER_TAG)
@Controller({
  path: MOVIES_CONTROLLER_BASE_PATH,
  version: MOVIES_CONTROLLER_VERSION,
})
export class MoviesAuditLogController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly auditLogService: MovieAuditLogsService) {}

  @Get(':id/logs')
  @ApiDocsForGetLogs()
  public async getLogs(@Param('id') id: string) {
    try {
      return await this.auditLogService.findAllByMovieId(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }
}
