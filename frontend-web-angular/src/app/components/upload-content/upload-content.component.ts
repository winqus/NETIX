import { environment } from '@ntx/environments/environment';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { formatDate, formatTime } from '@ntx/app/utils/utils';
import { MetadataService } from '@ntx/app/services/metadata/metadata.service';
import { UploadService } from '@ntx/app/services/upload/upload.service';
import { MediaConfigService } from '@ntx/app/services/mediaConfig.service';
import MetadataDTO from '@ntx/app/models/metadata.dto';
import { InputComponent } from '../shared/input/input.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { ImageService } from '@ntx/app/services/image.service';
import { SvgIconsComponent } from '../shared/svg-icons/svg-icons.component';

export enum Status {
  uploading,
  completed,
  failed,
}

@Component({
  selector: 'app-upload-content',
  standalone: true,
  imports: [InputComponent, FileUploadComponent, ImageUploadComponent, SvgIconsComponent],
  templateUrl: './upload-content.component.html',
})
export class UploadContentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('croppModal') croppModal!: ElementRef<HTMLDialogElement>;
  @ViewChild(FileUploadComponent) videoFileComponent!: FileUploadComponent;
  @ViewChild(ImageUploadComponent) imageFileComponent!: ImageUploadComponent;

  searchResults: MetadataDTO[] = [];
  searchFailed: boolean = false;
  titles: string[] = [];

  metadata: MetadataDTO | null = null;
  isMetadataFilled: boolean = false;
  isUploading: boolean = false;
  imageUploading: Status = Status.uploading;
  videoUploading: Status = Status.uploading;
  searchValue: string = '';
  videoFile: File | null = null;
  imageFile: File | null = null;
  title: string = '';
  date: string = '';
  duration: string = '';
  selectedMetadataJson: string = '';

  imageAccept: string = '';
  videoAccept: string = '';
  imageMaxSize: number = 0;
  videoMaxSize: number = 0;

  searchProp = {
    type: 'text',
    title: 'Enter video title or ID...',
    iconName: 'search',
    placeholder: 'Cars...',
    searchCharLimit: '3',
    value: this.searchValue,
    results: this.titles,
    searchFailed: this.searchFailed,
  };

  titleProp = {
    type: 'text',
    title: 'Title',
    placeholder: 'Title',
    value: this.title,
    readonly: true,
  };

  dateProp = {
    type: 'text',
    title: 'Date',
    placeholder: 'Date',
    value: this.date,
    readonly: true,
  };

  durationProp = {
    type: 'text',
    title: 'Duration',
    placeholder: '00:00:00',
    value: this.duration,
    readonly: true,
  };

  imageProp = {
    accept: this.imageAccept,
    maxSize: this.imageMaxSize,
    readonly: this.isMetadataFilled,
  };

  fileProp = {
    accept: this.videoAccept,
    maxSize: this.videoMaxSize,
    readonly: this.isMetadataFilled,
  };

  constructor(
    private metadataSearch: MetadataService,
    private upload: UploadService,
    private mediaConfig: MediaConfigService,
    private imageService: ImageService
  ) {}

  async ngOnInit(): Promise<any> {
    this.imageAccept = this.mediaConfig.getAllowedImageFormats().join(',');
    this.videoAccept = this.mediaConfig.getAllowedVideoFormats().join(',');
    this.imageMaxSize = this.mediaConfig.getMaxImageSize();
    this.videoMaxSize = this.mediaConfig.getMaxVideoSize();
  }

  ngAfterViewInit() {
    this.preventEscClose();
  }

  ngOnDestroy() {
    this.removeEscPrevent();
  }

  preventEscClose() {
    if (this.croppModal && this.croppModal.nativeElement) {
      this.croppModal.nativeElement.addEventListener('keydown', this.preventEsc);
    }
  }

  removeEscPrevent() {
    if (this.croppModal && this.croppModal.nativeElement) {
      this.croppModal.nativeElement.removeEventListener('keydown', this.preventEsc);
    }
  }

  preventEsc = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
    }
  };

  searchByTitle(search: string) {
    this.searchFailed = false;
    this.metadataSearch.getDataFromTitle(search).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.titles = this.searchResults.map((result) => result.title);
      },
      error: (error) => {
        this.searchFailed = true;
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

  recieveVideoFile(file: File | null) {
    this.videoFile = file;
  }

  recieveImageFile(file: File | null) {
    this.imageFile = file;
  }

  checkIfReadyToUpload() {
    return this.isMetadataFilled && this.videoFile !== null && this.imageFile !== null && !this.isUploading;
  }

  compressImage() {
    this.imageService.compressImage(this.imageFile!);
  }

  getIconNameFromStatus(status: Status): string {
    return (
      {
        [Status.uploading]: 'throbber',
        [Status.completed]: 'check_circle',
        [Status.failed]: 'x_circle',
      }[status] || ''
    );
  }

  getColorFromStatus(status: Status): string {
    return (
      {
        [Status.uploading]: 'white',
        [Status.completed]: 'green',
        [Status.failed]: 'red',
      }[status] || 'white'
    );
  }

  getTextFromStatus(status: Status): string {
    return (
      {
        [Status.uploading]: 'is being uploaded...',
        [Status.completed]: 'upload is completed.',
        [Status.failed]: 'upload failed.',
      }[status] || ''
    );
  }

  async uploadFiles() {
    this.isUploading = true;
    try {
      const compressImg = await this.imageService.compressImage(this.imageFile!);
      this.upload.uploadThumbnail(compressImg, this.metadata!.id).subscribe({
        error: (error) => {
          this.imageUploading = Status.failed;
          console.error('Error uploading image', error);
        },
        complete: () => {
          this.imageUploading = Status.completed;
          if (!environment.production) {
            console.log('Image upload completed');
          }
        },
      });

      this.upload.uploadVideo(this.videoFile!, this.metadata!.id).subscribe({
        error: (error) => {
          this.videoUploading = Status.failed;

          console.error('Error uploading video', error);
        },
        complete: () => {
          this.videoUploading = Status.completed;
          if (!environment.production) {
            console.log('Video upload completed');
          }
        },
      });
    } finally {
      this.isUploading = false;
    }
  }

  closeButtonStatus(): boolean {
    return this.imageUploading === Status.uploading && this.videoUploading === Status.uploading;
  }

  finishUplaod() {
    this.resetMetadata();
    this.videoFileComponent.clearFile();
    this.imageFileComponent.clearFile();
  }

  private resetMetadata(): void {
    this.metadata = null;
    this.searchValue = '';
    this.title = '';
    this.date = '';
    this.duration = '';
    this.selectedMetadataJson = '';
    this.isMetadataFilled = false;
  }
}
