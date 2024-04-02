import { Component, HostListener, Input } from '@angular/core';
import { MediaItem } from '../../models/mediaItem';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [],
  templateUrl: './movie-card.component.html',
})
export class MovieCardComponent {
  movie!: MediaItem;

  isMobile: boolean = false;

  constructor() {
    this.checkScreenSize();
  }

  @Input()
  set movieData(value: MediaItem) {
    this.movie = value;
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  get publishedDate(): string {
    if (!this.movie || !this.movie.releaseDate) return '0000';
    const date = this.movie.releaseDate;

    const year = date.getFullYear();
    return `${year}`;
  }

  get formattedDuration(): string {
    if (!this.movie || !this.movie.duration) return '00:00:00';
    const duration = this.movie.duration;
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
