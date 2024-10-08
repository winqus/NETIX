import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs/internal/Subject';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';
import { LibraryService } from '@ntx-shared/services/librarySearch/library.service';
import { ExternalTitleSearchResultItem, Provider } from '@ntx-shared/models/librarySearch.dto';
import { TitleType } from '@ntx-shared/models/titleType.enum';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, SvgIconsComponent],
})
export class SearchBarComponent implements OnInit {
  private searchSubject = new Subject<string>();
  results: ExternalTitleSearchResultItem[] | null = null;
  errorMessage: string | null = null;
  @Output() movieSelected = new EventEmitter<ExternalTitleSearchResultItem>();
  searchTerm: string = '';

  constructor(
    private libraryService: LibraryService,
    private cdr: ChangeDetectorRef
  ) {}

  onSearchTermChange() {
    if (this.searchTerm == null || this.searchTerm == '') return;

    this.searchSubject.next(this.searchTerm);
  }

  selectMovie(result: any) {
    this.movieSelected.emit(result);
    console.log(result);
    this.results = null;
  }

  handleKeyDown(event: KeyboardEvent, result: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.selectMovie(result);
      event.preventDefault();
    }
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(500)).subscribe(async (tempSearchTerm: string) => {
      if (tempSearchTerm == null || '') return;

      try {
        const result = await firstValueFrom(this.libraryService.search(tempSearchTerm, TitleType.MOVIE, Provider.NTX_DISCOVERY));
        if (result.size < 1) {
          this.errorMessage = 'No movies found for the given search query.';
          this.results = null;
        } else {
          this.results = result.searchResults[1].results;
          console.log(this.results);
          this.errorMessage = null;
        }
      } catch (error) {
        this.errorMessage = 'An error occurred while fetching the search results.';
        this.results = null;
      }
      console.log(tempSearchTerm);
      this.cdr.detectChanges();
    });
  }
}
