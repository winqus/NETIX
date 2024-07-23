import { Component } from '@angular/core';
import { FileUploadComponent } from '../file-upload/file-upload.component';
// import Cropper from 'cropperjs';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [],
  templateUrl: './image-upload.component.html',
  styleUrl: './image-upload.component.scss',
})
export class ImageUploadComponent extends FileUploadComponent {
  imageUrl: string | ArrayBuffer | null = null;

  override onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  override setFile(file: File): void {
    const url = URL.createObjectURL(file);
    const imgElement = document.getElementById('myImage') as HTMLImageElement;
    if (imgElement) {
      imgElement.src = url;
    }
  }
}
