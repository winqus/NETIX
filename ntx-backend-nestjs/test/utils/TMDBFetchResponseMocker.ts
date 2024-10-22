import { TEST_DATA_DIRECTORY, TEST_DIRECTORY } from '@ntx-test/constants';
import * as path from 'path';
import { JestCacheFetch } from './JestCacheFetch';

interface ITMDBFetchMocker {
  initialize(): void;
  isInitialized(): boolean;
  mockResponses(): void;
  dontMockResponses(): void;
}

const FORWARD_FETCH_IF_NOT_CACHED = false;
const COMPRESSED_CACHE_FILE = true;
const SAVED_CACHE_FILENAME = 'titleSearchTMDB_OkResponseCache.json';

export class TMDBFetchMocker implements ITMDBFetchMocker {
  private _isInitialized: boolean = false;
  private jestCacheFetch: JestCacheFetch;

  public initialize(): void {
    const cacheFilePath = path.resolve(process.cwd(), TEST_DIRECTORY, TEST_DATA_DIRECTORY, SAVED_CACHE_FILENAME);

    this.jestCacheFetch = new JestCacheFetch({
      cacheFilePath,
      cacheUrlOnlyMatchingRegex: /api\.themoviedb\.org/,
      forwardFetchIfNotCached: FORWARD_FETCH_IF_NOT_CACHED,
      realFetchResponseDelayMs: 5,
      usesFileCompression: COMPRESSED_CACHE_FILE,
    });

    this._isInitialized = true;
  }

  public isInitialized = () => this._isInitialized === true;

  public mockResponses(): void {
    if (!this.isInitialized()) {
      throw new Error('TMDBFetchMocker must be initialized before mocking responses');
    }

    this.jestCacheFetch.initialize(true);
  }

  public dontMockResponses(): void {
    if (!this.isInitialized()) {
      throw new Error('TMDBFetchMocker must be initialized before mocking responses');
    }

    this.jestCacheFetch.finalize(FORWARD_FETCH_IF_NOT_CACHED);
  }
}
