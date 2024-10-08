import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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

  selectMovie(result: any) {
    this.movieSelected.emit(result);
    this.results = null; // Clear results after selection
  }

  handleKeyDown(event: KeyboardEvent, result: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.selectMovie(result);
      event.preventDefault();
    }
  }

  searchTermFilter(searchTerm: string) {
    return !(!searchTerm || searchTerm.trim() === '');
  }

  onSearchTermChange() {
    // Emit the search term to the subject
    this.searchSubject.next(this.searchTerm);
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(500), distinctUntilChanged()).subscribe((tempSearchTerm) => this.handleSearch(tempSearchTerm));
  }

  private handleSearch(tempSearchTerm: string): void {
    if (!tempSearchTerm) {
      this.clearResults();
      return;
    }

    this.performSearch(tempSearchTerm);
  }

  private clearResults(): void {
    this.errorMessage = null;
    this.results = null;
  }

  private performSearch(tempSearchTerm: string): void {
    this.libraryService.search(tempSearchTerm, TitleType.MOVIE, Provider.NTX_DISCOVERY).subscribe({
      next: (result) => this.handleSearchResult(result),
      error: () => this.handleSearchError(),
    });
    this.cdr.detectChanges();
  }

  private handleSearchResult(result: any): void {
    if (result.size < 1) {
      this.errorMessage = 'No movies found for the given search query.';
      this.results = null;
    } else {
      this.results = result.searchResults[1].results;
      this.errorMessage = null;
    }
  }

  private handleSearchError(): void {
    this.errorMessage = 'An error occurred while fetching the search results.';
    this.results = null;
  }
}
