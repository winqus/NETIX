import { environment } from '../../../environments/environment';
import { Component } from '@angular/core';
import { InputComponent } from '../shared/input/input.component';
import { ButtonComponent } from '../shared/button/button.component';
import { Metadata } from '../../services/metadata/metadata.service';
import { FileUploadHadnlerComponent } from './components/file-upload-hadnler/file-upload-hadnler.component';
import MetadataDTO from '../../models/metadata.dto';
import { formatDate, formatTime } from '../../utils/utils';

@Component({
  selector: 'app-upload-content',
  standalone: true,
  imports: [InputComponent, ButtonComponent, FileUploadHadnlerComponent],
  templateUrl: './upload-content.component.html',
})
export class UploadContentComponent {
  searchResults: MetadataDTO[] = [];
  titles: string[] = [];

  metadata: MetadataDTO | null = null;
  isMetadataFilled: boolean = false;
  title: string = '';
  date: string = '';
  duration: string = '';
  selectedMetadataJson: string = '';

  constructor(private metadataSearch: Metadata) {}

  searchByTitle(search: string) {
    this.metadataSearch.getDataFromTitle(search).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.titles = this.searchResults.map((result) => result.title);
      },
      error: (error) => {
        console.error('Error fetching search results', error);
      },
      complete: () => {
        if (!environment.production) {
          console.log('Search completed');
        }
      },
    });
  }

  searchById(id: string, type: string, source: string): void {
    this.metadataSearch.getDataFromId(id, type, source).subscribe({
      next: (result) => {
        this.metadata = result;
        this.fillMetadata(this.metadata);
      },
      error: (error) => {
        console.error('Error fetching details', error);
      },
      complete: () => {
        if (!environment.production) {
          console.log('Detail fetch completed');
        }
      },
    });
  }

  onOptionSelected(option: string) {
    this.metadata = this.searchResults.find((result) => result.title === option) || null;
    this.titles = [];

    if (this.metadata != null) {
      this.searchById(this.metadata.id, this.metadata.type.toString(), this.metadata.sourceUUID);
    }
  }

  fillMetadata(metadata: MetadataDTO) {
    this.title = metadata.title;
    this.date = formatDate(metadata.releaseDate);
    this.duration = formatTime(metadata.details?.runtime);
    this.selectedMetadataJson = JSON.stringify(metadata, null, 4);
    this.isMetadataFilled = true;
  }
}
