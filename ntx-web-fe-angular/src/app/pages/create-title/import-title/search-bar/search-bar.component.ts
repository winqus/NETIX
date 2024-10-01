import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LibraryService } from '@ntx-app/shared/services/library.service';
import { debounceTime, firstValueFrom, Subject } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class SearchBarComponent implements OnInit {
  private searchSubject = new Subject<string>(); // For the search input
  @Input() results: any[] = [];
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
  }

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(500)).subscribe(async (tempSearchTerm: string) => {
      this.results = await firstValueFrom(this.libraryService.search(tempSearchTerm));
      console.log(tempSearchTerm);
    });
  }
}
