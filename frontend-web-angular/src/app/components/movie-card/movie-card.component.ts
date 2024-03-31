import { Component, HostListener, Input } from '@angular/core';
import { Video } from '../../models/video';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [],
  templateUrl: './movie-card.component.html',
})
export class MovieCardComponent {
  video?: Video;
  isLoading: boolean = true;
  isMobile: boolean = false;

  constructor() {
    this.checkScreenSize();
  }

  @Input()
  set videoData(value: Video) {
    this.video = value;
    this.isLoading = !value;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    // Consider "mobile" as any screen less than 768 pixels in width
    this.isMobile = window.innerWidth < 768;
  }

  get publishedDate(): string {
    if (!this.video || !this.video.publishedAt) return 'N/D';
    const date = this.video?.publishedAt;

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}`;
    return `${year}-${month}-${day}`;
  }

  get formattedDuration(): string {
    if (!this.video || !this.video.duration) return '00:00:00';
    const duration = this.video.duration;
    const hours = Math.floor(duration / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((duration % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (duration % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}
