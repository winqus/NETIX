import { Component, OnInit } from '@angular/core';
import { MovieCardComponent } from '@ntx/app/pages/movie-list/movie-card/movie-card.component';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { MovieDTO } from '@ntx-shared/models/movie.dto';
import { environment } from '@ntx/environments/environment.development';
import { ErrorHandlerService } from '@ntx-shared/services/errorHandler.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-example',
  standalone: true,
  templateUrl: './movie-list.component.html',
  imports: [MovieCardComponent],
})
export class MovieListComponent implements OnInit {
  title = 'netix';
  redirectUrl = '';
  skeletonNumber: number[] = Array.from({ length: 20 }, (_, i) => i);
  movies: MovieDTO[] = [];

  isLoadingMovies: boolean = true;
  constructor(
    private readonly movieService: MovieService,
    private readonly route: ActivatedRoute,
    private readonly errorHandler: ErrorHandlerService
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.redirectUrl = data['movieCardRedirect'] ?? '';
    });

    this.movieService.getMovies().subscribe({
      next: (response) => {
        if (environment.development) console.log('Get movies:', response);
        this.movies = response;
        this.movies.sort((a, b) => new Date(b.originallyReleasedAt).getTime() - new Date(a.originallyReleasedAt).getTime());
        this.isLoadingMovies = false;
      },
      error: (errorResponse) => {
        if (environment.development) console.error('Error getting movies:', errorResponse);
        this.errorHandler.showError('Please try again later.', 'Initial server error');
        this.isLoadingMovies = false;
      },
    });
  }

  getRedirectUrl(): string {
    return this.redirectUrl;
  }

  isMoviePublished(movie: MovieDTO): boolean {
    if (this.redirectUrl == 'inspect/movie' || movie.isPublished) return true;

    return false;
  }
}
