import { Component } from '@angular/core';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { MovieCardSkeletonComponent } from '../movie-card-skeleton/movie-card-skeleton.component';
import { MediaItem } from '@ntx/app/models/mediaItem';
import { MovieService } from '@ntx/app/services/movie.service';

@Component({
  selector: 'app-example',
  standalone: true,
  templateUrl: './movie-list.component.html',
  imports: [MovieCardComponent, MovieCardSkeletonComponent],
})
export class MovieListComponent {
  title = 'netix';

  skeletonNumber: number[] = Array.from({ length: 20 }, (_, i) => i);
  movies: MediaItem[] = [];

  isLoadingMovies: boolean = true;
  constructor(private movieService: MovieService) {}

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngAfterViewInit() {
    this.movieService.getMovies().subscribe((movies) => {
      this.movies = movies;
      this.isLoadingMovies = false;
    });
  }
}
