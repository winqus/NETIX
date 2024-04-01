import { Component, Input } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

interface NavbarProps {
  title: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  @Input() props: NavbarProps = { title: '' };

  constructor(private router: Router) {}

  get isUploadRoute(): boolean {
    return this.router.url === '/upload';
  }
}
