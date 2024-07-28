import { environment } from '@ntx/environments/environment';
import { Component, OnInit } from '@angular/core';
import { InputComponent } from '../shared/input/input.component';
import { MetadataService } from '@ntx/app/services/metadata/metadata.service';
import MetadataDTO from '@ntx/app/models/metadata.dto';
import { formatDate, formatTime } from '@ntx/app/utils/utils';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { MediaConfigService } from '@ntx/app/services/mediaConfig.service';

@Component({
  selector: 'app-upload-content',
  standalone: true,
  imports: [InputComponent, FileUploadComponent, ImageUploadComponent],
  templateUrl: './upload-content.component.html',
})
export class UploadContentComponent implements OnInit {
  searchResults: MetadataDTO[] = [];
  titles: string[] = [];

  metadata: MetadataDTO | null = null;
  isMetadataFilled: boolean = false;
  title: string = '';
  date: string = '';
  duration: string = '';
  selectedMetadataJson: string = '';

  imageAccept: string = '';
  videoAccept: string = '';
  imageMaxSize: number = 0;
  videoMaxSize: number = 0;

  constructor(
    private metadataSearch: MetadataService,
    private mediaConfig: MediaConfigService
  ) {}

  async ngOnInit(): Promise<any> {
    this.imageAccept = this.mediaConfig.getAllowedImageFormats().join(',');
    this.videoAccept = this.mediaConfig.getAllowedVideoFormats().join(',');
    this.imageMaxSize = this.mediaConfig.getMaxImageSize();
    this.videoMaxSize = this.mediaConfig.getMaxVideoSize();
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

  searchValueChange(searchValue: string) {
    if (searchValue == '') {
      this.title = '';
      this.date = '';
      this.duration = '';
      this.selectedMetadataJson = '';
      this.isMetadataFilled = false;
    }
  }
}
