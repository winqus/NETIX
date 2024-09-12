import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from '@ntx/environments/environment';
import { formatDate, formatTime, downLoadFile } from '@ntx-shared/services/utils/utils';
import { KeyCode } from '@ntx-shared/constants/key-code.constants';
import { MetadataService } from '@ntx-shared/services/metadata/metadata.service';
import { UploadService } from '@ntx-shared/services/upload/upload.service';
import { MediaConfigService } from '@ntx-shared/services/mediaConfig.service';
import { ImageService } from '@ntx-shared/services/image.service';
import MetadataDTO from '@ntx-shared/models/metadata.dto';
import { InputComponent } from '@ntx-shared/ui/input/input.component';
import { TextareaComponent } from '@ntx-shared/ui/textarea/textarea.component';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload-content',
  standalone: true,
  imports: [InputComponent, TextareaComponent, ImageUploadComponent],
  templateUrl: './upload-content.component.html',
})
export class UploadContentComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('croppModal') cropModalElement!: ElementRef<HTMLDialogElement>;
  @ViewChild(ImageUploadComponent) imageFileComponent!: ImageUploadComponent;

  searchResults: MetadataDTO[] = [];
  searchFailed: boolean = false;
  titles: string[] = [];

  metadata: MetadataDTO | null = null;
  isMetadataFilled: boolean = false;
  isUploading: boolean = false;
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
    private imageService: ImageService,
    private httpClient: HttpClient
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
    if (this.cropModalElement && this.cropModalElement.nativeElement) {
      this.cropModalElement.nativeElement.addEventListener('keydown', this.preventEsc);
    }
  }

  removeEscPrevent() {
    if (this.cropModalElement && this.cropModalElement.nativeElement) {
      this.cropModalElement.nativeElement.removeEventListener('keydown', this.preventEsc);
    }
  }

  preventEsc = (event: KeyboardEvent) => {
    if (event.key === KeyCode.Escape) {
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

  async downloadAndCropImage(imageUrl: string) {
    try {
      await this.httpClient.get(imageUrl, { responseType: 'blob' }).subscribe((response) => this.recieveImageFile(new File([downLoadFile(response, 'application/ms-excel')], 'downloadedImage.jpg')));

      // const imageFile = new File([imageBlob], 'downloadedImage.jpg', { type: imageBlob.type });
    } catch (error) {
      console.error('Error downloading image:', error);
    }
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

  recieveImageFile(file: File | null) {
    this.imageFile = file;
  }

  checkIfReadyToUpload() {
    return this.isMetadataFilled && this.videoFile !== null && this.imageFile !== null && !this.isUploading;
  }

  compressImage() {
    this.imageService.compressImage(this.imageFile!);
  }

  async uploadFiles() {
    this.isUploading = true;
    try {
      const compressImg = await this.imageService.compressImage(this.imageFile!);
      this.upload.uploadThumbnail(compressImg, this.metadata!.id).subscribe({
        error: (error) => {
          console.error('Error uploading image', error);
        },
        complete: () => {
          if (!environment.production) {
            console.log('Image upload completed');
          }
        },
      });
    } finally {
      this.isUploading = false;
    }
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
