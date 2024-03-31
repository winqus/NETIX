import { Component } from '@angular/core';
import { MovieCardComponent } from '../movie-card/movie-card.component';
import { Video } from '../../models/video';
import { MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-example',
  standalone: true,
  templateUrl: './example.component.html',
  imports: [MovieCardComponent],
})
export class ExampleComponent {
  title = 'netix';

  skeletonNumber: number[] = Array.from({ length: 20 }, (_, i) => i);
  movies: Video[] = [];

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
