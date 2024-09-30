import { Logger } from '@nestjs/common';
import { ExternalTitleSearchResultItem } from '../external-providers.types';
import { ExternalTitleSelectionArgs, IExternalTitleSelector } from '../interfaces/external-title-selector.interface';

export class SameOrderExternalTitleSelector implements IExternalTitleSelector {
  private readonly logger = new Logger(this.constructor.name);

  constructor() {}

  public async select(args: ExternalTitleSelectionArgs): Promise<ExternalTitleSearchResultItem[]> {
    return args.candidates.sort((a, b) => b.weight - a.weight);
  }
}
