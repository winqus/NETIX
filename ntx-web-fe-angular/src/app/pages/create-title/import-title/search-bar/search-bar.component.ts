import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LibraryService } from '@ntx-shared/services/librarySearch/library.service';
import { ExternalTitleSearchResultItem } from '@ntx-shared/models/librarySearch.dto';
import { Subject } from 'rxjs/internal/Subject';
import { firstValueFrom } from 'rxjs/internal/firstValueFrom';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SearchBarComponent implements OnInit {
  private searchSubject = new Subject<string>();
  @Input() results: ExternalTitleSearchResultItem[] = [];
  @Output() movieSelected = new EventEmitter<string>();
  searchTerm: string = '';

  constructor(
    private libraryService: LibraryService,
    private cdr: ChangeDetectorRef
  ) {}

  onSearchTermChange() {
    this.searchSubject.next(this.searchTerm);
    // this.movieTitles = this.libraryService.getMovieTitles(this.searchTerm);
    // this.cdr.detectChanges();
  }

  selectMovie(result: any) {
    this.movieSelected.emit(result);
    this.results = [];
    this.movieSelected.emit(result);
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(500)).subscribe(async (tempSearchTerm: string) => {
      const result = await firstValueFrom(this.libraryService.search(tempSearchTerm));

      this.results = result.searchResults[1].results;
      console.log(tempSearchTerm);
    });
  }
}
