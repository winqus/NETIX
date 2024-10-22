import { Observable } from 'rxjs/internal/Observable';
import { LibrarySearchResultDTO } from '@ntx-shared/models/librarySearch.dto';
import { TitleType } from '@ntx-shared/models/titleType.enum';

export interface ILibraryService {
  search(query: string, type: TitleType, providers: string, limit?: number): Observable<LibrarySearchResultDTO>;
}
