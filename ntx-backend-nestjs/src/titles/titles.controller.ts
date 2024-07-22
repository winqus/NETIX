import { Controller, HttpException, Logger, Post } from '@nestjs/common';
import { CustomHttpInternalErrorException } from '@ntx/common/exceptions/HttpInternalError.exception';
import { CONTROLLER_BASE_PATH, CONTROLLER_VERSION } from './titles.constants';
import { TitlesService } from './titles.service';

@Controller({
  path: CONTROLLER_BASE_PATH,
  version: CONTROLLER_VERSION,
})
export class TitlesController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly titlesService: TitlesService) {}

  // TODO: implement createTitle method
  @Post()
  async createTitle() {
    try {
      // TODO: logic
    } catch (error) {
      this.logger.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        this.logger.debug(error.stack);
        throw new CustomHttpInternalErrorException(error);
      }
    }
  }
}
