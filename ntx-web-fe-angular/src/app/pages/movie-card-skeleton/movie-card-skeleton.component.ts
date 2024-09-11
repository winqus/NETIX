import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-movie-card-skeleton',
  standalone: true,
  imports: [],
  templateUrl: './movie-card-skeleton.component.html',
})
export class MovieCardSkeletonComponent {
  isMobile: boolean = false;

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }
}
