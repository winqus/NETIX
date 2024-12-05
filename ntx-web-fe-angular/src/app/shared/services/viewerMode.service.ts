import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ViewerModeService {
  private isViewerModeEnabled = false;

  constructor() {
    const savedState = localStorage.getItem('viewerMode');
    this.isViewerModeEnabled = savedState === 'true';
  }

  enableViewerMode() {
    this.isViewerModeEnabled = true;
    localStorage.setItem('viewerMode', 'true');
  }

  disableViewerMode() {
    this.isViewerModeEnabled = false;
    localStorage.setItem('viewerMode', 'false');
  }

  isViewerMode(): boolean {
    return this.isViewerModeEnabled;
  }
}
