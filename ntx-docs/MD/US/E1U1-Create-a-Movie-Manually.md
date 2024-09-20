## Thumbnail file requirements:
* Ratio 2:3 (Width:Height)
* Max file size 100KB
* PNG/JP[E]G/WEBP (stored as WEBP)

## DTOs
```typescript
interface CreateMovieDTO {
    name: string; // 1-200
    summary: string; // 1-1000
    originallyReleasedAt: Date;
    runtimeMinutes: number; // 1-12000 (integer)
}

interface MovieDTO {
    id: string;
    name: string;
    summary: string;
    originallyReleasedAt: Date;
    runtimeMinutes: number;
    posterID: string;
}
```

## Movie Controller Routes
`POST /api/v1/movies`

* Body: Multipart/form-data with data from `CreateMovieDTO` and file attached as `poster` (multipart/form-data)
* Response status: 201
* Response body: `MovieDTO`

## MovieService
```ts
interface MovieService {
    public async createMovie(dto: CreateMovieDTO): Promise<void>;
}
```

## MoviesRepository
```ts
interface MoviesRepository {
    public async existsByHash(hash: string): Promise<boolean>;
    public async create(movie: Movie): Promise<Movie>;
}
```

## PosterService
```ts
interface PosterService {
    public async addCreatePosterJob(file: FileInStorage): Promise<string>
}
```

## PosterSize
```ts
enum PosterSize {
    XS = 'XS',
    S = 'S',
    M = 'M',
    L = 'L',
}
```

## Movie Content Hash
The content hash of a movie is calculated from string values as follows:
`hash = "<name>|<orginiallyReleasedAt>|<runtimeMinutes>"`