import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { generateRandomId } from '@ntx-shared/services/utils/utils';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';

export interface InputProps {
  title?: string;
  accept?: string;
  readonly?: boolean;
  maxSize?: number;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './file-upload.component.html',
})
export class FileUploadComponent implements OnInit, OnChanges {
  @Input() props: InputProps = {};
  @Output() filePassed = new EventEmitter<File | null>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  defaultProps: InputProps = {
    title: '-Imported image-',
    accept: '',
    readonly: false,
    maxSize: Number.MAX_VALUE,
  };

  fileUploadId: string = '';
  file: File | null = null;
  isDraggingOver: boolean = false;

  ngOnInit() {
    if (!this.fileUploadId) {
      this.fileUploadId = `file-upload-${generateRandomId()}`;
    }
  }

  ngOnChanges(): void {
    this.props = { ...this.defaultProps, ...this.props };
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    if (this.validateFile(file)) {
      this.setFile(file);
    }
  }

  validateFile(file: File): boolean {
    if (!this.props || !this.props.maxSize) {
      return false;
    }

    if (file.size > this.props.maxSize!) {
      return false;
    }

    if (this.props.accept && !this.isFileTypeAccepted(file)) {
      return false;
    }

    return true;
  }

  isFileTypeAccepted(file: File): boolean {
    if (!this.props.accept) {
      return true;
    }

    const acceptedTypes = this.props.accept.split(',').map((type) => type.trim());
    const fileType = file.type;
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    return acceptedTypes.some((acceptType) => {
      if (acceptType.startsWith('.')) {
        return fileExtension === acceptType.substring(1).toLowerCase();
      } else {
        return fileType === acceptType || fileType.startsWith(`${acceptType.split('/')[0]}/`);
      }
    });
  }

  setFile(file: File) {
    this.filePassed.emit(file);
    this.file = file;
  }

  clearFileInput(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.clearFile();
  }

  clearFile() {
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    this.file = null;
    this.filePassed.emit(this.file);
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length && this.props.readonly) {
      const file = event.dataTransfer.files[0];
      if (this.validateFile(file)) {
        this.setFile(file);
      }
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = false;
  }
}
