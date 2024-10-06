import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs/internal/Subject';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { LibraryService } from '@ntx-shared/services/librarySearch/library.service';
import { ExternalTitleSearchResultItem, Provider } from '@ntx-shared/models/librarySearch.dto';
import { TitleType } from '@ntx-shared/models/titleType.enum';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SearchBarComponent implements OnInit {
  private searchSubject = new Subject<string>();
  results: ExternalTitleSearchResultItem[] | null = null;
  @Output() movieSelected = new EventEmitter<ExternalTitleSearchResultItem>();
  searchTerm: string = '';

  constructor(
    private libraryService: LibraryService,
    private cdr: ChangeDetectorRef
  ) {}

  onSearchTermChange() {
    this.searchSubject.next(this.searchTerm);
    // this.movieTitles = this.libraryService.getMovieTitles(this.searchTerm);
    this.cdr.detectChanges();
  }

  selectMovie(result: any) {
    this.movieSelected.emit(result);
    console.log(result);
    this.results = null;
    // this.movieSelected.emit(result);
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(500)).subscribe(async (tempSearchTerm: string) => {
      if (tempSearchTerm == null || '') return;

      const result = await firstValueFrom(this.libraryService.search(tempSearchTerm, TitleType.MOVIE, Provider.NTX_DISCOVERY));

      this.results = result.searchResults[1].results;
      console.log(tempSearchTerm);
    });
  }
}
