import { Component } from '@angular/core';
import { MovieCardComponent } from '@ntx/app/pages/movie-list/components/movie-card/movie-card.component';
import { MovieCardSkeletonComponent } from '@ntx/app/pages/movie-list/components/movie-card-skeleton/movie-card-skeleton.component';
import { MovieService } from '@ntx-shared/services/movie/movie.service';
import { MovieDTO } from '@ntx-shared/models/movie.dto';

@Component({
  selector: 'app-example',
  standalone: true,
  templateUrl: './movie-list.component.html',
  imports: [MovieCardComponent, MovieCardSkeletonComponent],
})
export class MovieListComponent {
  title = 'netix';

  skeletonNumber: number[] = Array.from({ length: 20 }, (_, i) => i);
  movies: MovieDTO[] = [];

  isLoadingMovies: boolean = true;
  constructor(private movieService: MovieService) {}

  // eslint-disable-next-line @angular-eslint/use-lifecycle-interface
  ngAfterViewInit() {
    this.movieService.__getTestMovies().subscribe((movies) => {
      this.movies = movies;
      console.log(movies);
      this.isLoadingMovies = false;
    });
  }
}
