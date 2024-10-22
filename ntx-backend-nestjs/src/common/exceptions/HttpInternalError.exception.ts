import { HttpStatus } from '@nestjs/common/enums/http-status.enum';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { ENV, ENVIRONMENTS } from '@ntx/app.constants';

export class CustomHttpInternalErrorException extends HttpException {
  constructor(error: Error) {
    const currentEnv = process.env[ENV] || null;
    switch (currentEnv) {
      case ENVIRONMENTS.DEVELOPMENT: {
        const respMessage = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error. Check server logs.',
          error: 'Internal server error',
          timestamp: new Date().toLocaleString(),
          developmentErrorInfo: {
            name: error.name,
            description: error.message,
            stack: error.stack,
          },
        };
        super(respMessage, HttpStatus.INTERNAL_SERVER_ERROR);

        break;
      }
      case ENVIRONMENTS.PRODUCTION: {
        const respMessage = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error. Check server logs.',
          error: 'Internal server error',
          timestamp: new Date().toLocaleString(),
        };
        super(respMessage, HttpStatus.INTERNAL_SERVER_ERROR);

        break;
      }
      default: {
        super('Some internal server error. Check server logs.', HttpStatus.INTERNAL_SERVER_ERROR);

        break;
      }
    }
  }
}
