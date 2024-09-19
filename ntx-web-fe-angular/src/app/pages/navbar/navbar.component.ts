import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SvgIconsComponent } from '../../../app/shared/ui/svg-icons/svg-icons.component';
// import { AuthService } from '@auth0/auth0-angular';
import { CommonModule } from '@angular/common';

interface NavbarProps {
  title: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, SvgIconsComponent, CommonModule],
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
}
