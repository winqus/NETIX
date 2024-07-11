import { Component } from '@angular/core';
import { InputComponent } from '../shared/input/input.component';
import { ButtonComponent } from '../shared/button/button.component';

@Component({
  selector: 'app-upload-content',
  standalone: true,
  imports: [InputComponent, ButtonComponent],
  templateUrl: './upload-content.component.html',
})
export class UploadContentComponent {}
