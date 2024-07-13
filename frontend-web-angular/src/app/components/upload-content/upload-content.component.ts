import { Component, HostListener } from '@angular/core';
import { InputComponent } from '../shared/input/input.component';
import { ButtonComponent } from '../shared/button/button.component';
import { MetadataSearch } from '../../services/metadataSearch.service';
import MetadataDTO from '../../models/metadata.dto';
import { formatDate, formatTime } from '../../utils/utils';

@Component({
  selector: 'app-upload-content',
  standalone: true,
  imports: [InputComponent, ButtonComponent],
  templateUrl: './upload-content.component.html',
})
export class UploadContentComponent {
  searchResults: MetadataDTO[] = [];
  titles: string[] = [];

  metadata: MetadataDTO | null = null;
  isMetadataFilled: boolean = false;
  title: string = '';
  date: string = '';
  durration: string = '';
  selectedMetadataJson: string = '';

  constructor(private metadataSearch: MetadataSearch) {}

  @HostListener('window:dragover', ['$event'])
  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('window:drop', ['$event'])
  onDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.handleThumbnailDrop(file);
      } else if (file.type.startsWith('video/')) {
        this.handleVideoDrop(file);
      }
    }
  }

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
        console.log('Search completed');
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
        console.log('Detail fetch completed');
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
    this.durration = formatTime(metadata.details?.runtime);
    this.selectedMetadataJson = JSON.stringify(metadata, null, 4);
    this.isMetadataFilled = true;
  }

  handleThumbnailDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Process the thumbnail file
      console.log('Thumbnail dropped:', file);
    }
  }

  handleVideoDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Process the video file
      console.log('Video dropped:', file);
    }
  }

  allowDrop(event: DragEvent) {
    event.preventDefault();
  }
}
