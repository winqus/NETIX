import { Component } from '@angular/core';
import { UploadContentComponent } from '@ntx-pages/create-title/upload-content/upload-content.component';

@Component({
  selector: 'app-create-title',
  standalone: true,
  imports: [UploadContentComponent],
  templateUrl: './create-title.component.html',
  styleUrl: './create-title.component.scss',
})
export class CreateTitleComponent {}
