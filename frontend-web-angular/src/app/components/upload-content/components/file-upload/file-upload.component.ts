import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { generateRandomId } from '@ntx/app/utils/utils';
import { SvgIconsComponent } from '@ntx/app/components/shared/svg-icons/svg-icons.component';
import { retry } from 'rxjs';

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
  @Output() filePassed = new EventEmitter<File>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  defaultProps: InputProps = {
    title: 'Upload File',
    accept: '',
    readonly: false,
    maxSize: Number.MAX_VALUE,
  };

  fileUploadId: string = '';
  file?: File;
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
    this.validateAndSetFile(file);
  }

  validateAndSetFile(file: File) {
    if (!this.props || !this.props.maxSize) {
      return;
    }

    if (this.props.maxSize > Number.MAX_VALUE && file.size > this.props.maxSize!) {
      return;
    }

    if (this.props.accept && !this.isFileTypeAccepted(file)) {
      return;
    }

    this.setFile(file);
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

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }

    this.file = undefined;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer && event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];
      this.validateAndSetFile(file);
    }
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDraggingOver = false;
  }
}
