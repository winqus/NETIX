import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';

import { SearchBarComponent } from './search-bar.component';
import { LibraryService } from '@ntx-shared/services/librarySearch/library.service';
import { searchResponseFixture } from '@ntx/app/shared/services/librarySearch/librarySearchTestData';
import { TitleType } from '@ntx/app/shared/models/titleType.enum';
import { Provider } from '@ntx/app/shared/models/librarySearch.dto';
import { of } from 'rxjs/internal/observable/of';
import { throwError } from 'rxjs';
import { SearchResultDTOMapper } from '../../mappers/SearchResultDTO.mapper';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let mockLibraryService: any;

  beforeEach(async () => {
    mockLibraryService = jasmine.createSpyObj('LibraryService', ['search']);

    await TestBed.configureTestingModule({
      imports: [SearchBarComponent],
      providers: [{ provide: LibraryService, useValue: mockLibraryService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not perform search for empty input', fakeAsync(() => {
    component.searchTerm = '';
    component.onSearchTermChange();

    tick(500);
    expect(mockLibraryService.search).not.toHaveBeenCalled();
  }));

  it('should call library service when a valid search term is provided', fakeAsync(() => {
    component.providers = Provider.NTX_DISCOVERY;
    mockLibraryService.search.and.returnValue(of(searchResponseFixture));

    component.searchTerm = 'Shrek';
    component.onSearchTermChange();
    tick(500);

    expect(mockLibraryService.search).toHaveBeenCalledWith('Shrek', TitleType.MOVIE, Provider.NTX_DISCOVERY);
  }));

  it('should set results when search returns data', fakeAsync(() => {
    mockLibraryService.search.and.returnValue(of(searchResponseFixture));

    component.providers = Provider.NTX_DISCOVERY;

    component.searchTerm = 'Shrek';
    component.onSearchTermChange();
    tick(500);
    fixture.detectChanges();

    expect(mockLibraryService.search).toHaveBeenCalledWith('Shrek', TitleType.MOVIE, Provider.NTX_DISCOVERY);

    expect(component.results).toEqual(SearchResultDTOMapper.anyToSearchResultDTOArray(searchResponseFixture.searchResults[1].results));
    expect(component.errorMessage).toBeNull();
    expect(component.isLoading).toBeFalse();
  }));

  it('should display "No movies found" message when no results are found', fakeAsync(() => {
    const emptyResponse = { size: 0, searchResults: [{ id: 'ntx-discovery', size: 0, results: [] }] }; // Mock empty response
    mockLibraryService.search.and.returnValue(of(emptyResponse));

    component.searchTerm = 'NonExistingMovie';
    component.onSearchTermChange();
    tick(500);
    fixture.detectChanges();

    expect(component.results).toBeNull(); // Results should be null
    expect(component.errorMessage).toBe('No movies found for the given search query.'); // Display correct message
    expect(component.isLoading).toBeFalse();
  }));

  it('should handle search errors', fakeAsync(() => {
    mockLibraryService.search.and.returnValue(throwError(() => new Error('Search error')));

    component.searchTerm = 'Shrek';
    component.onSearchTermChange();
    tick(500);
    fixture.detectChanges();

    expect(component.results).toBeNull(); // No results should be set
    expect(component.errorMessage).toBe('An error occurred while fetching the search results.'); // Error message should be set
    expect(component.isLoading).toBeFalse(); // Loading should be false
  }));

  it('should emit the selected movie', () => {
    spyOn(component.movieSelected, 'emit');
    const movie = SearchResultDTOMapper.anyToSearchResultDTO(searchResponseFixture.searchResults[1].results[0]);

    component.selectMovie(movie);

    expect(component.movieSelected.emit).toHaveBeenCalledWith(movie);
    expect(component.results).toBeNull();
  });

  it('should handle Enter key press to select movie', () => {
    spyOn(component, 'selectMovie');
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    const movie = searchResponseFixture.searchResults[1].results[0];

    component.handleKeyDown(event, movie);

    expect(component.selectMovie).toHaveBeenCalledWith(movie);
  });
});
