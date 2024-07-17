import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-file-upload-hadnler',
  standalone: true,
  imports: [],
  templateUrl: './file-upload-hadnler.component.html',
  styleUrl: './file-upload-hadnler.component.scss',
})
export class FileUploadHadnlerComponent {
  @Input() fileUploadId: string = '';
  @Input() accept: string = '';
  @Input() disabled: boolean = false;
  @Input() value: string = '';

  dragOverHandler($event: DragEvent) {
    throw new Error('Method not implemented.');
  }
  dropHandler($event: DragEvent) {
    throw new Error('Method not implemented.');
  }
  dragLeaveHandler($event: DragEvent) {
    throw new Error('Method not implemented.');
  }
}
