import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';
import { UploadConstraintsDTO } from '@ntx-shared/models/uploadConstraints.dto';
import { AlertCardComponent } from '@ntx-shared/ui/alert-card/alert-card.component';

@Component({
  selector: 'app-file-selection',
  standalone: true,
  templateUrl: './file-selection.component.html',
  imports: [SvgIconsComponent, AlertCardComponent],
})
export class VideoFileSelectionComponent {
  @Input() isVideo!: boolean;
  @Input() constraints: UploadConstraintsDTO | null = null;
  @Input() file!: File | null;
  @Output() filePassed = new EventEmitter<File>();

  isDraggingOver: boolean = false;

  videoMimeTypeMap: Map<string, string> = new Map([['video/x-matroska', 'MKV']]);
  pictureMimeTypeMap: Map<string, string> = new Map([['', '']]);

  hideError: boolean = true;
  handleCardHide($event: boolean) {
    this.hideError = $event;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    this.setFile(file);
  }

  dragOverHandler(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = true;
  }

  dropHandler(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];

      this.setFile(file);
    }
  }

  dragLeaveHandler(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = false;
  }

  getFileName(): string {
    if (this.file) return this.file.name;

    return '';
  }

  setFile(file: File) {
    if (this.checkConstraints(file)) {
      this.filePassed.emit(file);
      this.file = file;
    } else {
      this.hideError = false;
    }
  }

  checkConstraints(file: File): boolean {
    if (!this.isValidMediaFormat(file)) return false;

    if (this.isVideo) {
      if (file.size > this.constraints!.videoFileConstraints.sizeInBytes.max) return false;
    } else {
      if (file.size > this.constraints!.thumbnailConstraints.maxSizeBytes) return false;
    }
    return true;
  }

  isValidMediaFormat(file: File): boolean {
    if (this.constraints) {
      if (this.isVideo) return this.constraints.videoFileConstraints.allowedMimeTypes.includes(file.type);

      return this.constraints.thumbnailConstraints.allowedMimeTypes.includes(file.type);
    }
    return false;
  }

  mediaFormats(): string {
    if (this.constraints) {
      if (this.isVideo) return this.constraints.videoFileConstraints.allowedMimeTypes.join(', ');

      return this.constraints.thumbnailConstraints.allowedMimeTypes.join(', ');
    }

    return '';
  }

  mediaItem(): string {
    return this.isVideo ? 'video file' : 'thumbnail';
  }

  mimeTypes(): string {
    if (this.constraints) {
      if (this.isVideo) {
        return this.formatAllowedMediaTypes(this.constraints.videoFileConstraints.allowedMimeTypes, this.videoMimeTypeMap);
      }

      return this.formatAllowedMediaTypes(this.constraints.thumbnailConstraints.allowedMimeTypes, this.pictureMimeTypeMap);
    }

    return '';
  }

  formatAllowedMediaTypes(allowedMediaFormats: string[], mimeTypeMap: Map<string, string>): string {
    const formattedTypes = allowedMediaFormats.map((mimeType) => {
      if (mimeTypeMap.has(mimeType)) {
        return mimeTypeMap.get(mimeType);
      } else {
        return mimeType.split('/')[1].toUpperCase();
      }
    });

    const lastIndex = formattedTypes.length - 1;
    return formattedTypes
      .map((type, index) => (index === lastIndex && index > 0 ? ' or ' : ', ') + type)
      .join('')
      .substring(2);
  }
}
