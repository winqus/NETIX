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
  uplading,
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
  imageUploading: Status = Status.uplading;
  videoUploading: Status = Status.uplading;
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
    switch (status) {
      case Status.uplading:
        return 'throbber';
      case Status.completed:
        return 'check_circle';
      case Status.failed:
        return 'x_circle';
      default:
        return '';
    }
  }

  getColorFromStatus(status: Status): string {
    switch (status) {
      case Status.completed:
        return 'green';
      case Status.failed:
        return 'red';
      default:
        return 'white';
    }
  }

  getTextFromStatus(status: Status): string {
    switch (status) {
      case Status.uplading:
        return 'is being uploaded...';
      case Status.completed:
        return 'upload is completed.';
      case Status.failed:
        return 'upload failed.';
    }
  }

  async uploadFiles() {
    this.isUploading = true;
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
  }

  closeButtonStatus(): boolean {
    if (this.imageUploading != Status.uplading && this.videoUploading != Status.uplading) {
      return false;
    }

    return true;
  }

  finishUplaod() {
    this.metadata = null;
    this.searchValue = '';
    this.title = '';
    this.date = '';
    this.duration = '';
    this.selectedMetadataJson = '';
    this.videoFileComponent.clearFile();
    this.imageFileComponent.clearFile();
  }
}
