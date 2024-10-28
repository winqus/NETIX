import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SvgIconsComponent } from '@ntx-shared/ui/svg-icons/svg-icons.component';
// import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '@ntx-shared/ui/search-bar/search-bar.component';
import { Provider } from '@ntx-shared/models/librarySearch.dto';
import { SearchResultDTO } from '@ntx-shared/models/searchResult.dto';
interface NavbarProps {
  title: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, SvgIconsComponent, CommonModule, SearchBarComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  @Input() props: NavbarProps = { title: '' };

  constructor(
    private router: Router
    // public auth: AuthService
  ) {}

  get isCreateTitleRoute(): boolean {
    return this.router.url === '/createTitle';
  }

  logout(): void {
    // this.auth.logout();
  }
  getProviders() {
    return Provider.NTX.toString();
  }
  onMovieSelected(movie: SearchResultDTO) {
    if (movie == null || movie.id == null) return;

    this.router.navigate(['/inspect/movies', movie.id]);
  }
}
