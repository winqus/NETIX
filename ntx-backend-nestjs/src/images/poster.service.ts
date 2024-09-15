import { Injectable, Logger } from '@nestjs/common';
import { FileInStorage } from '@ntx/file-storage/types';
import { generateUUIDv4 } from '@ntx/utility/generateUUIDv4';

@Injectable()
export class PosterService {
  private readonly logger = new Logger(this.constructor.name);

  constructor() {}

  public async createPoster(file: FileInStorage): Promise<string> {
    // TODO: Implement this method with job queue

    return generateUUIDv4();
  }
}
