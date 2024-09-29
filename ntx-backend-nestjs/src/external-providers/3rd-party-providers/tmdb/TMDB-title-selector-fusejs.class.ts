import { normalize } from '@ntx/common/utils/mathUtils';
import { ExternalProviders } from '@ntx/external-providers/external-providers.constants';
import { TitleSearchResult } from '@ntx/external-providers/interfaces/TitleSearchResult.interface';
import { FuseResult, FuseSortFunctionArg, IFuseOptions } from 'fuse.js';
import { TMDBTitleSelectionArgs, TMDBTitleSelector } from './interfaces/TMDB-title-selector.interface';
import { TMDBTitle } from './interfaces/TMDBTitle';
import { TMDBTitleMapper } from './TMDB-title.mapper';

const Fuse = require('fuse.js');

const fuseOptions: IFuseOptions<any> = {
  findAllMatches: true,
  keys: ['title', 'originalTitle'],
  threshold: 0.6,
  distance: 30,
  includeScore: true,
  shouldSort: true,
  minMatchCharLength: 1,
  ignoreFieldNorm: false, // Can improve matching, or not...
};

export class TMDBTitleSelectorFuseJS implements TMDBTitleSelector {
  public async select({ candidates, query, maxResults }: TMDBTitleSelectionArgs): Promise<TitleSearchResult[]> {
    if (!candidates || candidates.length === 0) {
      return [];
    }

    if (candidates.length === 1) {
      const title = TMDBTitleMapper.TMDBTitle2TitleSearchResult(candidates[0]);
      title.weight = 1.0;

      return [title];
    }

    if (!query || query.length === 0) {
      return [];
    }

    if (maxResults == null || maxResults <= 0) {
      maxResults = candidates.length;
    }

    if (candidates.length <= 5) {
      candidates = this.normalizeTMDBTitlesPopularity(candidates);

      const titleSearchResults: TitleSearchResult[] = candidates
        .map((title) => TMDBTitleMapper.TMDBTitle2TitleSearchResult(title))
        .sort((a, b) => b.weight - a.weight);

      const fuzeResults = this.filterResultsWithFuse(query, titleSearchResults);

      const combinedResults: TitleSearchResult[] = [
        ...fuzeResults.map((result) => {
          return { ...result.item, score: result.score };
        }),
      ];

      const fuzzySearchResultIds = new Set(fuzeResults.map((result) => result.item.id));
      for (const titleResult of titleSearchResults) {
        if (fuzzySearchResultIds.has(titleResult.id) === false) {
          combinedResults.push(titleResult);
        }
      }

      combinedResults.forEach((result) => {
        const TMDB_WEIGHT = 0.3;
        const FUZEJS_WEIGHT = 1 - TMDB_WEIGHT;

        let score = 0.0;
        if ('score' in result) {
          score = (result as any).score!;
        }

        result.weight = parseFloat((result.weight * TMDB_WEIGHT + score * FUZEJS_WEIGHT).toFixed(3));
      });

      return combinedResults.slice(0, maxResults).sort((a, b) => b.weight - a.weight);
    }

    candidates.sort((a, b) => {
      return b.popularity - a.popularity;
    });

    if (candidates.length > 10) {
      candidates = candidates.filter((title) => title.popularity > 10.0);
    }

    let normalizedTitles: TMDBTitle[] = this.normalizeTMDBTitlesPopularity(candidates);
    if (normalizedTitles.length > 10) {
      normalizedTitles = normalizedTitles.filter((title) => title.popularity > 0.03);
    }

    const titleSearchResults: TitleSearchResult[] = normalizedTitles.map((title) =>
      TMDBTitleMapper.TMDBTitle2TitleSearchResult(title),
    );

    // TODO: extract Fuzzy search
    const fuzzySearchResults: FuseResult<TitleSearchResult>[] = this.filterResultsWithFuse(query, titleSearchResults);

    const TMDB_WEIGHT = 0.0;
    const FUZEJS_WEIGHT = 1 - TMDB_WEIGHT;
    const simpleAdditiveWeightingResults: TitleSearchResult[] = fuzzySearchResults.map((result) => {
      (result as any).item.originalWeight = result.item.weight; // Save original weight for debugging
      result.item.weight = parseFloat((result.item.weight * TMDB_WEIGHT + result.score! * FUZEJS_WEIGHT).toFixed(3));

      return result.item;
    });

    if (TMDB_WEIGHT > 0.0) {
      simpleAdditiveWeightingResults.sort((a, b) => b.weight - a.weight);
    }

    return simpleAdditiveWeightingResults.slice(0, maxResults).map((result) => {
      return {
        id: result.id,
        title: result.title,
        originalTitle: result.originalTitle,
        type: result.type,
        weight: result.weight,
        // originalWeight: result.originalWeight, // For debugging
        releaseDate: result.releaseDate,
        sourceUUID: ExternalProviders.TMDB,
      };
    });
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

  private filterResultsWithFuse(query: string, results: TitleSearchResult[]): FuseResult<TitleSearchResult>[] {
    const fuse = new Fuse(results, fuseOptions);
    const fuseResults = fuse.search(query);
    fuseResults.forEach((result: FuseSortFunctionArg) => {
      result.score = 1.0 - result.score; // Invert score to be more intuitive for our use case
    });

    return fuseResults;
  }
}
