import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  constructor() {}

  public search(query: string, type = 'MOVIE', providers: string[] = []): Observable<any[]> {
    //return filteredListFromAPI()
    return of([{ name: 'Shrek' }, { name: 'Shrek 2' }, { name: 'Shrek 3' }, { name: 'Shrek 4' }]);
  }
}
