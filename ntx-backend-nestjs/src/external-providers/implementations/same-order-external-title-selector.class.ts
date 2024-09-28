import { Logger } from '@nestjs/common';
import { ExternalTitleSearchResultItem } from '../external-providers.types';
import { ExternalTitleSelectionArgs, IExternalTitleSelector } from '../interfaces/external-title-selector.interface';

export class SameOrderExternalTitleSelector implements IExternalTitleSelector {
  private readonly logger = new Logger(this.constructor.name);

  constructor() {}

  public async select(args: ExternalTitleSelectionArgs): Promise<ExternalTitleSearchResultItem[]> {
    return args.candidates.map((candidate, index) => ({
      providerID: candidate.providerID,
      externalID: candidate.externalID,
      type: candidate.type,
      weight: this.calculateCandidateWeight(index, args.candidates.length),
      metadata: candidate.metadata,
    }));
  }

  private calculateCandidateWeight(index: number, total: number): number {
    if (total === 0) {
      throw new Error('Cannot calculate candidate weight with total 0');
    }

    return (total - index) / total;
  }
}
