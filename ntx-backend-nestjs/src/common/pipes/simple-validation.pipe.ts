import { ArgumentMetadata, Injectable, PipeTransform, ValidationPipe } from '@nestjs/common';

const simpleControllerValidationPipeFactory = () => {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  });
};

@Injectable()
export class SimpleValidationPipe implements PipeTransform {
  private pipeTransformStrategy: PipeTransform;

  constructor(validationPipe?: ValidationPipe) {
    if (validationPipe instanceof ValidationPipe) {
      this.pipeTransformStrategy = validationPipe;
    } else {
      this.pipeTransformStrategy = simpleControllerValidationPipeFactory();
    }
  }

  transform(value: any, metadata: ArgumentMetadata) {
    return this.pipeTransformStrategy.transform(value, metadata);
  }
}
