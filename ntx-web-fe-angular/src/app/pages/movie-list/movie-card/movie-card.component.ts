import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getPoster } from '@ntx/app/shared/config/api-endpoints';
import { MovieDTO } from '@ntx/app/shared/models/movie.dto';
import { PosterSize } from '@ntx/app/shared/models/posterSize.enum';
import { SvgIconsComponent } from '@ntx/app/shared/ui/svg-icons.component';

export const titleUpdateBadgeThresholdDays = 7;

@Component({
  selector: 'app-movie-card',
  standalone: true,
  imports: [SvgIconsComponent],
  templateUrl: './movie-card.component.html',
})
export class MovieCardComponent implements OnInit, OnDestroy {
  @Input() movie: MovieDTO | null = null;
  posterLoaded = true;
  recentlyUpdatedLabel: string = '';
  private updateInterval: any;

  constructor(private readonly router: Router) {}

  ngOnInit(): void {
    this.updateRecentlyUpdatedLabel();

    this.updateInterval = setInterval(() => {
      this.updateRecentlyUpdatedLabel();
    }, 60000);
  }

  ngOnDestroy(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  get publishedDate(): string {
    if (!this.movie || !this.movie.originallyReleasedAt) return '-';

    const date = this.movie.originallyReleasedAt;

    const year = date.getFullYear();
    return `${year}`;
  }

  isPublished() {
    if (this.movie == null) return false;

    return this.movie.isPublished;
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

  isMovieRecentlyUpdated(): boolean {
    if (this.movie == null) return false;

    const currentDate = new Date();
    const sevenDaysAgo = new Date(currentDate);
    sevenDaysAgo.setDate(currentDate.getDate() - titleUpdateBadgeThresholdDays);

    return this.movie?.updatedAt >= sevenDaysAgo && this.movie?.updatedAt <= currentDate;
  }

  updateRecentlyUpdatedLabel(): void {
    this.recentlyUpdatedLabel = this.getRecentlyUpdatedLabel();
  }

  getRecentlyUpdatedLabel(): string {
    if (!this.movie?.updatedAt) return '';

    const currentDate = new Date();
    const updatedDate = new Date(this.movie.updatedAt);
    const timeDifference = currentDate.getTime() - updatedDate.getTime();

    const minutesDifference = Math.floor(timeDifference / (1000 * 60));
    const hoursDifference = Math.floor(minutesDifference / 60);
    const daysDifference = Math.floor(hoursDifference / 24);

    if (minutesDifference < 1) return `Updated just now`;
    if (hoursDifference < 1) return `Updated ${minutesDifference} minutes ago`;
    if (daysDifference < 1) return `Updated ${hoursDifference} hours ago`;

    return `Updated ${daysDifference} days ago`;
  }
}
