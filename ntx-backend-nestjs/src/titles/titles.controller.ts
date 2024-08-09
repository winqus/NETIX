import { Controller, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { CONTROLLER_BASE_PATH, CONTROLLER_VERSION } from './titles.constants';
import { TitlesService } from './titles.service';

@Controller({
  path: CONTROLLER_BASE_PATH,
  version: CONTROLLER_VERSION,
})
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class TitlesController {
  private readonly logger = new Logger(this.constructor.name);

  constructor(private readonly titlesService: TitlesService) {}
}
