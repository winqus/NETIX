import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Model } from 'mongoose';
import { Title } from './interfaces/title.interface';
import { TITLE_MODEL } from './titles.constants';

@Injectable()
export class TitlesService {
  private readonly logger = new Logger(this.constructor.name);

  constructor(@Inject(TITLE_MODEL) private readonly titleModel: Model<Title>) {}

  // TODO: Handle Video Created Event, assign video ID to title
  // @OnEvent(VIDEO_PROCESSED_EVENT)
  // async handleVideoProcessedEvent(payload: VideoProcessedEvent) {
  //  some logic
  // }

  // TODO: Handle Thumbnail Created Event, assign thumbnail ID to title
}
