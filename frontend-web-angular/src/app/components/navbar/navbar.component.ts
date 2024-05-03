import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { SvgIconsComponent } from '../svg-icons/svg-icons.component';
import { AuthService } from '@auth0/auth0-angular';
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
    private router: Router,
    public auth: AuthService
  ) {}

  get isUploadRoute(): boolean {
    return this.router.url === '/upload';
  }

  logout(): void {
    this.auth.logout();
  }
}
