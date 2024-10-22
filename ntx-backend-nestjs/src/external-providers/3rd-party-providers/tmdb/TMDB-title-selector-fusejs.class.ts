import { normalize } from '@ntx/common/utils/mathUtils';
import { FuseResult, FuseSortFunctionArg, IFuseOptions } from 'fuse.js';
import { TMDBTitleSelectionArgs, TMDBTitleSelector } from './interfaces/TMDB-title-selector.interface';
import { TMDBTitle, WeightedTMDBTitle } from './interfaces/TMDBTitle';

const Fuse = require('fuse.js');

const fuseOptions: IFuseOptions<any> = {
  findAllMatches: false,
  keys: ['title', 'originalTitle', 'name', 'original_name'],
  threshold: 0.6,
  distance: 30,
  includeScore: true,
  shouldSort: true,
  minMatchCharLength: 1,
  ignoreFieldNorm: true, // Can improve matching, or not...
};

type TMDBTitleWithScore = TMDBTitle & { score: number };
type WeightedTMDBTitleWithScore = WeightedTMDBTitle & { score: number };

export class TMDBTitleSelectorFuseJS implements TMDBTitleSelector {
  public async select({ candidates, query, maxResults }: TMDBTitleSelectionArgs): Promise<WeightedTMDBTitle[]> {
    if (!candidates || candidates.length === 0 || !query || query.length === 0) {
      return [];
    }

    const candidatesLength = candidates.length;

    if (maxResults == null || maxResults <= 0) {
      maxResults = candidatesLength;
    }

    if (candidatesLength === 1) {
      const title = candidates[0] as WeightedTMDBTitle;
      title.weight = 1.0;

      return [title];
    }

    if (candidatesLength > 10) {
      /* Filter out unpopular titles as they are less likely to be relevant */
      candidates = candidates.filter((title) => title.popularity > 10.0);
    }

    let normalizedTitles = this.normalizeTMDBTitlesPopularity(candidates);

    if (normalizedTitles.length > 10) {
      /* Filter out the bottom 3% of unpopular titles as they are less likely to be relevant */
      normalizedTitles = normalizedTitles.filter((title) => title.popularity > 0.03);
    }

    const fuseSearchResults = this.filterResultsWithFuse(query, normalizedTitles);
    const scoredTMDBTitles = fuseSearchResults.map((title) => {
      return {
        ...title.item,
        score: title.score,
      } as TMDBTitleWithScore;
    });

    if (candidatesLength <= 5) {
      /* Add remaining candidates that weren't found by Fuse.js just in case they are relevant */
      const fuzzySearchResultIds = new Set(fuseSearchResults.map((result) => result.item.id));
      for (const candidate of candidates) {
        if (fuzzySearchResultIds.has(candidate.id) === false) {
          scoredTMDBTitles.push(candidate as any);
        }
      }
    }

    const TMDB_WEIGHT = candidatesLength <= 5 ? 0.3 : 0.0;
    const FUZEJS_WEIGHT = 1 - TMDB_WEIGHT;
    const simpleAdditiveWeightedTMDBTitles = scoredTMDBTitles.map((titleItem) => {
      (titleItem as WeightedTMDBTitleWithScore).weight = parseFloat(
        (titleItem.popularity * TMDB_WEIGHT + titleItem.score * FUZEJS_WEIGHT).toFixed(5),
      );

      delete (titleItem as any).score;

      return titleItem as WeightedTMDBTitleWithScore;
    });

    const selectedCandidates = simpleAdditiveWeightedTMDBTitles
      .sort((a, b) => b.weight - a.weight)
      .slice(0, maxResults);

    return selectedCandidates;
  }

  private normalizeTMDBTitlesPopularity(titles: TMDBTitle[]): TMDBTitle[] {
    if (titles.length === 0) {
      return [];
    }

    const sortedByPopularityDesc = Array.from(titles).sort((a, b) => {
      return b.popularity - a.popularity;
    });

    const normalizedPopularity = normalize(
      sortedByPopularityDesc.map((title) => title.popularity),
      true,
      sortedByPopularityDesc[sortedByPopularityDesc.length - 1].popularity,
      sortedByPopularityDesc[0].popularity,
    );

    sortedByPopularityDesc.forEach((movie, index) => {
      movie.popularity = normalizedPopularity[index];
    });

    return sortedByPopularityDesc;
  }

  private filterResultsWithFuse(query: string, results: TMDBTitle[]): FuseResult<TMDBTitleWithScore>[] {
    const fuse = new Fuse(results, fuseOptions);
    const fuseResults = fuse.search(query);
    fuseResults.forEach((result: FuseSortFunctionArg) => {
      result.score = 1.0 - result.score; /* Invert score to be more intuitive for our use case */
    });

    return fuseResults;
  }
}
