import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ExternalTitleSearchResultItem, LibrarySearchResultDTO } from '@ntx-shared/models/librarySearch.dto';
import { searchResponseFixture } from '@ntx-shared/services/librarySearch/librarySearchTestData';
import { TitleType } from '@ntx-shared/models/titleType.enum';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  constructor() {}

  public search(query: string, type: TitleType = TitleType.MOVIE, providers: string[] = []): Observable<LibrarySearchResultDTO> {
    // const filteredResults =
    //   searchResponseFixture.searchResults.find((result: { id: string }) => result.id === 'ntx-discovery')?.results.map((item) => ({ ...item, type: TitleType[item.type as keyof typeof TitleType] })) ||
    //   [];
    return of(searchResponseFixture as LibrarySearchResultDTO);
  }
}
