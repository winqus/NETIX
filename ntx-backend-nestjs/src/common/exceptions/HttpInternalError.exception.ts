import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ENV, ENVIRONMENTS } from '../../constants';

export class CustomHttpInternalErrorException extends HttpException {
  constructor(error: Error) {
    const currentEnv = process.env[ENV] || null;
    switch (currentEnv) {
      case ENVIRONMENTS.DEVELOPMENT:
        const respMessage = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error.',
          developmentErrorInfo: {
            timestamp: Date.now(),
            name: error.name,
            description: error.message,
            stack: error.stack,
          },
        };
        super(respMessage, HttpStatus.INTERNAL_SERVER_ERROR);
        break;
      case ENVIRONMENTS.PRODUCTION:
        super(`(${Date.now()}) Internal server error. Check server logs.`, HttpStatus.INTERNAL_SERVER_ERROR);
        break;
      default:
        super('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        break;
    }
  }
}
