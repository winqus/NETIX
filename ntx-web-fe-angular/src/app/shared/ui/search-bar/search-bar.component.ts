import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { LibraryService } from '@ntx-shared/services/librarySearch/library.service';
import { Provider } from '@ntx-shared/models/librarySearch.dto';
import { TitleType } from '@ntx-shared/models/titleType.enum';
import { SvgIconsComponent } from '@ntx/app/shared/ui/svg-icons.component';
import { SearchResultDTO } from '@ntx-shared/models/searchResult.dto';
import { SearchResultDTOMapper } from '@ntx-shared/mappers/SearchResultDTO.mapper';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule, SvgIconsComponent],
})
export class SearchBarComponent implements OnInit {
  private readonly searchSubject = new Subject<string>();
  @Input({ required: true }) providers: string = '';
  @Input({ required: true }) id: string = '';
  results: SearchResultDTO[] | null = null;
  errorMessage: string | null = null;
  @Output() movieSelected = new EventEmitter<SearchResultDTO>();
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(
    private readonly libraryService: LibraryService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  selectMovie(result: any) {
    this.movieSelected.emit(result);
    this.results = null;
  }

  handleKeyDown(event: KeyboardEvent, result: any) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.selectMovie(result);
      event.preventDefault();
    }
  }

  getAdditionalInfo(searchResultitem: SearchResultDTO): string {
    let info = searchResultitem.type + ' · ' + searchResultitem.year;

    if (searchResultitem.provider != null) {
      info += ' · ' + searchResultitem.provider;
    }

    return info;
  }

  getName(searchResultitem: SearchResultDTO): string {
    return searchResultitem.name;
  }

  searchTermFilter(searchTerm: string) {
    return !(!searchTerm || searchTerm.trim() === '');
  }

  onSearchTermChange() {
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
    this.isLoading = false;
  }

  private performSearch(tempSearchTerm: string): void {
    this.isLoading = true;
    this.libraryService.search(tempSearchTerm, TitleType.MOVIE, this.providers).subscribe({
      next: (result) => {
        this.handleSearchResult(result);
      },
      error: () => this.handleSearchError(),
    });
    this.cdr.detectChanges();
  }

  private handleSearchResult(result: any): void {
    this.isLoading = false;

    if (result.size < 1) {
      this.errorMessage = 'No movies found for the given search query.';
      this.results = null;
      return;
    }

    let tempResult = null;
    if (this.providers == Provider.NTX) {
      tempResult = result.searchResults[0].results;
    } else {
      tempResult = result.searchResults[1].results;
    }

    this.results = SearchResultDTOMapper.anyToSearchResultDTOArray(tempResult);

    this.errorMessage = null;
  }

  private handleSearchError(): void {
    this.errorMessage = 'An error occurred while fetching the search results.';
    this.results = null;
    this.isLoading = false;
  }
}
