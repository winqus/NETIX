import { Component, HostListener, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [],
  templateUrl: './movie-card.component.html',
})
export class MovieCardComponent {
  @Input() movie!: MovieDTO;
  isMobile: boolean = false;

  constructor(private router: Router) {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  private checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
  }

  get publishedDate(): string {
    if (!this.movie || !this.movie.originallyReleasedAt) return '0000';
    const date = this.movie.originallyReleasedAt;

    const year = date.getFullYear();
    return `${year}`;
  }

  get formattedDuration(): string {
    if (!this.movie || !this.movie.runtimeMinutes) return '00:00:00';
    const duration = this.movie.runtimeMinutes;
    const hours = Math.floor(duration / 3600)
      .toString()
      .padStart(2, '0');
    const minutes = Math.floor((duration % 3600) / 60)
      .toString()
      .padStart(2, '0');
    const seconds = (duration % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  isReady(): boolean {
    return false;
  }

  watch() {
    if (this.isReady()) this.router.navigate(['/watch', this.movie.id], { state: { data: this.movie } });
  }

  movieState(): string {
    return '';
  }
}
