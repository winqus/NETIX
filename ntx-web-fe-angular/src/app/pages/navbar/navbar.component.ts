import { Component, Input, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SvgIconsComponent } from '@ntx/app/shared/ui/svg-icons.component';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '@ntx-shared/ui/search-bar/search-bar.component';
import { Provider } from '@ntx-shared/models/librarySearch.dto';
import { SearchResultDTO } from '@ntx-shared/models/searchResult.dto';
import { AuthService } from '@ntx-auth/auth.service';
import { Role, User } from '@ntx-auth/user.entity';
import { ViewerModeService } from '@ntx/app/shared/services/viewerMode.service';
interface NavbarProps {
  title: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, SvgIconsComponent, CommonModule, SearchBarComponent],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent implements OnInit {
  @Input() props: NavbarProps = { title: '' };
  user?: User;

  constructor(
    private readonly router: Router,
    public auth: AuthService,
    private readonly viewerModeService: ViewerModeService
  ) {}

  get isCreateTitleRoute(): boolean {
    return this.router.url === '/create/title';
  }

  ngOnInit() {
    this.auth.user.subscribe((user) => {
      this.user = user ?? undefined;
      if (!this.isManager()) {
        this.viewerModeService.disableViewerMode();
      }
    });
  }

  isLoggedIn(): boolean {
    if (this.user != null) return true;

    this.router.navigate(['/auth']);
    return false;
  }

  login(): void {
    this.auth.login();
    this.auth.user.subscribe((user) => {
      this.user = user ?? undefined;
    });
  }

  logout(): void {
    this.auth.logout();
  }

  getUserNameLetter(): string {
    return this.user!.username[0].toLocaleUpperCase();
  }

  getProviders() {
    return Provider.NTX.toString();
  }

  isManager(): boolean {
    return this.user?.roles.includes(Role.Manager) || false;
  }

  redirectMain(): string {
    if (this.isViewerMode()) return '/';

    return this.isManager() ? '/manage/titles' : '/';
  }

  toggleViewerMode(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.viewerModeService.enableViewerMode();
      this.router.navigate(['/']);
    } else {
      this.viewerModeService.disableViewerMode();
      this.router.navigate(['/manage/titles']);
    }
  }

  isViewerMode(): boolean {
    return this.viewerModeService.isViewerMode();
  }

  isCreateMovieEnabled(): boolean {
    return this.isManager() && !this.isViewerMode();
  }

  onMovieSelected(movie: SearchResultDTO) {
    if (movie == null || movie.id == null) return;

    const a = this.router.url === '/' ? '/view/movie' : '/inspect/movie';

    this.router.navigate([a, movie.id]);
  }
}
