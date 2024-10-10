import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { getPoster } from '@ntx/app/shared/config/api-endpoints';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { PosterSize } from '@ntx/app/shared/models/posterSize.enum';
import { SvgIconsComponent } from '@ntx/app/shared/ui/svg-icons/svg-icons.component';

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './movie-card.component.html',
})
export class MovieCardComponent {
  @Input() movie: MovieDTO | null = null;
  posterLoaded = true;

  constructor(private router: Router) {}

  get publishedDate(): string {
    if (!this.movie || !this.movie.originallyReleasedAt) return '-';

    const date = this.movie.originallyReleasedAt;

    const year = date.getFullYear();
    return `${year}`;
  }

  onPosterError(): void {
    this.posterLoaded = false;
  }

  posterSource(): string {
    if (this.movie == null) return '';
    return getPoster(this.movie.posterID, PosterSize.L);
  }

  navigateToMovie(): void {
    if (this.movie == null) return;

    this.router.navigate(['/inspect/movies', this.movie.id]);
  }
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      this.navigateToMovie();
    }
  }
}
