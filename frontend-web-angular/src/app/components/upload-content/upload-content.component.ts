import { Component } from '@angular/core';
import { InputComponent } from '../shared/input/input.component';
import { ButtonComponent } from '../shared/button/button.component';
import { MetadataSearch } from '../../services/metadataSearch.service';
import MetadataDTO from '../../models/metadata.dto';

@Component({
  selector: 'app-upload-content',
  standalone: true,
  imports: [InputComponent, ButtonComponent],
  templateUrl: './upload-content.component.html',
})
export class UploadContentComponent {
  searchResults: MetadataDTO[] = [];
  titles: string[] = [];
  constructor(private metadataSearch: MetadataSearch) {}

  search(search: string) {
    this.metadataSearch.getMovies(search).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.titles = this.searchResults.map((result) => result.title);
        console.log(this.searchResults);
      },
      error: (error) => {
        console.error('Error fetching search results', error);
      },
      complete: () => {
        console.log('Search completed');
      },
    });
  }
}
