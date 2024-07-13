import { Injectable } from '@nestjs/common';

@Injectable()
export class ThumbnailsService {
  constructor() {}

  async processThumbnailForTitle(titleID: string, file: Express.Multer.File) {
    console.log(`Processing thumbnail for title ${titleID}`);
  }
}
