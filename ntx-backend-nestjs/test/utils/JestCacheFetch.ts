import * as fs from 'fs';

const DEFAULT_RESPONSE_STATUS = 200;
const ENCODING = 'utf8';
const JSON_STRINGIFY_REPLACER = null;
const JSON_STRINGIFY_SPACE = undefined;
const DEFAULT_REAL_FETCH_RESPONSE_DELAY_MS = 100;
const DEFAULT_REGEX = /./;

const DEFAULT_FORWARD_FETCH_IF_NOT_CACHED = true;
const NOT_FOUND_CACHED_RESPONSE_STATUS = 404;
const NOT_FOUND_CACHED_RESPONSE_BODY = null;

interface JestCacheFetchConfig {
  cacheFilePath: string;
  forwardFetchIfNotCached: boolean;
  realFetchResponseDelayMs: number;
  cacheUrlOnlyMatchingRegex: RegExp;
}

export type JestCacheFetchArgs = Partial<JestCacheFetchConfig> & { cacheFilePath: string };

export class JestCacheFetch {
  private _cache = new Map<string, any>();
  private _config: JestCacheFetchConfig;
  private _originalFetch: typeof fetch;

  constructor(config: JestCacheFetchArgs) {
    this._config = {
      cacheFilePath: config.cacheFilePath,
      forwardFetchIfNotCached: config.forwardFetchIfNotCached ?? DEFAULT_FORWARD_FETCH_IF_NOT_CACHED,
      realFetchResponseDelayMs: config.realFetchResponseDelayMs ?? DEFAULT_REAL_FETCH_RESPONSE_DELAY_MS,
      cacheUrlOnlyMatchingRegex: config.cacheUrlOnlyMatchingRegex ?? DEFAULT_REGEX,
    };

    this._originalFetch = global.fetch;
  }

  public initialize(loadLocalCache = true) {
    if (loadLocalCache) {
      this.ensureDirectoryExists();
      this.loadCache();
    }
    this.setupCachedFetch();
  }

  public finalize(saveLocalCache = true) {
    if (saveLocalCache) {
      this.ensureDirectoryExists();
      this.saveCache();
    }

    global.fetch = this._originalFetch;
  }

  public hardReset() {
    this._cache.clear();
    this.saveCache();
  }

  loadCache() {
    if (fs.existsSync(this._config.cacheFilePath)) {
      const fileContent = fs.readFileSync(this._config.cacheFilePath, ENCODING);
      const jsonData = JSON.parse(fileContent);
      Object.entries(jsonData).forEach(([key, value]) => this._cache.set(key, value));
    }
  }

  saveCache() {
    const cacheObject = Object.fromEntries(this._cache);
    if (cacheObject == null || Object.keys(cacheObject).length === 0) {
      return;
    }

    fs.writeFileSync(
      this._config.cacheFilePath,
      JSON.stringify(cacheObject, JSON_STRINGIFY_REPLACER, JSON_STRINGIFY_SPACE),
    );
  }

  setupCachedFetch() {
    const handler = {
      apply: (_target: any, _thisArg: any, argumentsList: [string, RequestInit]) => {
        return this.mockedFetchImplementation(...argumentsList);
      },
    };

    global.fetch = new Proxy(this._originalFetch, handler);
  }

  private ensureDirectoryExists() {
    let directory = this._config.cacheFilePath.replace(/\\/g, '/');
    directory = directory.substring(0, directory.lastIndexOf('/'));

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
  }

  private isCachableUrl(url: string): boolean {
    return this._config.cacheUrlOnlyMatchingRegex.test(url);
  }

  private async fetchTimeout() {
    return new Promise((resolve) => setTimeout(resolve, this._config.realFetchResponseDelayMs));
  }

  private mockedFetchImplementation = async (url: string, options: RequestInit): Promise<Response> => {
    const key = `${url.toString()}`;

    if (this._cache.has(key)) {
      const cachedData = this._cache.get(key);

      return new Response(JSON.stringify(cachedData), { status: DEFAULT_RESPONSE_STATUS });
    }

    if (this._config.forwardFetchIfNotCached === false) {
      return new Response(NOT_FOUND_CACHED_RESPONSE_BODY, { status: NOT_FOUND_CACHED_RESPONSE_STATUS });
    }

    const response = await this._originalFetch(url, options);

    await this.fetchTimeout();

    if (response.ok) {
      const data = await response.json();

      if (this.isCachableUrl(key)) {
        this._cache.set(key, data);
      }

      return new Response(JSON.stringify(data), { status: response.status });
    }

    return response;
  };
}
