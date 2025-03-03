import { Component } from '@angular/core';
import { UploadTitleComponent } from '@ntx-pages/create-title/upload-title/upload-title.component';
import { ImportTitleComponent } from '@ntx-pages/create-title/import-title/import-title.component';

@Component({
  selector: 'app-create-title',
  standalone: true,
  imports: [UploadTitleComponent, ImportTitleComponent],
  templateUrl: './create-title.component.html',
  styleUrl: './create-title.component.scss',
})
export class CreateTitleComponent {}
