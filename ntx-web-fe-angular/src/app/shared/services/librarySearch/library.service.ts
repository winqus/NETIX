import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { LibrarySearchResultDTO } from '@ntx-shared/models/librarySearch.dto';
import { TitleType } from '@ntx-shared/models/titleType.enum';
import { ILibraryService } from './ILibrary.service.interface';
import { getLibrarySearch } from '@ntx-shared/config/api-endpoints';
import { LibrarySearchResultDTOMapper } from '@ntx/app/shared/mappers/LibrarySearchResultDTO.mapper';
import { environment } from '@ntx/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class LibraryService implements ILibraryService {
  constructor(private readonly http: HttpClient) {}

  public search(query: string, type: TitleType, providers: string, limit?: number): Observable<LibrarySearchResultDTO> {
    if (environment.development) console.log(`LibraryService is searching for: <${query}>`);
    const url = getLibrarySearch(query, type, providers, limit);
    const httpOptions = {};

    return this.http.get(url, httpOptions).pipe(
      map((response: any) => {
        return LibrarySearchResultDTOMapper.anyToLibrarySearchResultDTO(response);
      }),
      catchError((error) => {
        console.error('Error fetching search query:', error);
        return throwError(() => error);
      })
    );
  }
}
