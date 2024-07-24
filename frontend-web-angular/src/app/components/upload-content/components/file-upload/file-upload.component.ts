import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { generateUniqueId } from '../../../../utils/utils';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss'],
})
export class FileUploadComponent implements OnInit {
  @Input() title: string = 'Upload File';
  @Input() accept: string = '';
  @Input() readonly: boolean = false;
  @Input() maxSize: number = -1; // Maximum file size in bytes, -1 for no limit

  @Output() filePassed = new EventEmitter<File>();

  id: string = '';
  file?: File;
  isDraggingOver: boolean = false;

  ngOnInit() {
    if (!this.id) {
      this.id = `file-upload-${generateUniqueId()}`;
    }
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
    if (this.maxSize > -1 && file.size > this.maxSize) {
      return;
    }

    this.setFile(file);
  }

  setFile(file: File) {
    this.filePassed.emit(file);
    this.file = file;
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
