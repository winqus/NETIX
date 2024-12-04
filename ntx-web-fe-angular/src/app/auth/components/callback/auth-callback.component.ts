import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [],
  template: `
    <div class="container mx-auto p-8 flex justify-center items-center h-screen">
      <div class="text-center">
        <div class="flex justify-center mt-4">
          <progress class="progress progress-error w-56"></progress>
        </div>

        <p class="mt-4 text-base-content">
          {{ infoMessage }}
        </p>
      </div>
    </div>
  `,
})
export class AuthCallbackComponent implements OnInit, OnDestroy {
  infoMessage = 'Loading...';

  private timeoutId: any;

  constructor(
    private readonly router: Router,
    private readonly auth: AuthService
  ) {}

  ngOnInit() {
    this.timeoutId = setTimeout(() => {
      this.router.navigate(['/error/404']);
    }, 3000);

    this.auth.user.subscribe({
      next: (user) => {
        if (user) {
          clearTimeout(this.timeoutId);
          this.router.navigate(['/']);
        }
      },
      error: () => {
        clearTimeout(this.timeoutId);
      },
    });
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
