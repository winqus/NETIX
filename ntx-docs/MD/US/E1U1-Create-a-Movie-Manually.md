## Thumbnail file requirements:
* Ratio 2:3 (Width:Height)
* Max size 100kb
* PNG/JP[E]G/WEBP (stored as WEBP)

## CreateMovieDTO
```typescript
interface CreateMovieDTO {
    name: string; // 1-200
    summary: string; // 1-1000
    originallyReleasedAt: Date;
    runtimeMinutes: number // 1-12000 (integer)
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

* Body: `CreateMovieDTO`, file attached as `poster` (multipart/form-data)
* Response status: 201
* Response body: `MovieDTO`

## MovieService
```typescript
interface MovieService {
    createMovie(dto: CreateMovieDTO): Promise<void>;
}

enum PosterSize {
    XS = 'XS',
    S = 'S',
    M = 'M',
    L = 'L',
}

interface Images{
    createPoster(File fileBuffer, PosterSize targerSize):  
}
```