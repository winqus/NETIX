import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ErrorHandlerService {
  constructor(private readonly toastr: ToastrService) {}

  showError(message: string, title: string = 'Error'): void {
    this.toastr.error(message, title);
  }

  showSuccess(message: string, title: string = 'Success'): void {
    this.toastr.success(message, title);
  }
}
