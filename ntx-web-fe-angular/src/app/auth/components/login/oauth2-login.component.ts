import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-oauth2-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container mx-auto p-8 flex justify-center items-center h-screen">
      <div class="text-center">
        @if (isLoading) {
          <div class="flex justify-center mt-4">
            <progress class="progress progress-error w-56"></progress>
          </div>
        }

        <p class="mt-4 text-base-content">
          {{ infoMessage }}
        </p>

        @if (errorMessage) {
          <p class="mt-4 text-error">
            {{ errorMessage }}
          </p>
          <a routerLink="{{ onErrorGoToPath }}">Go Home ({{ redirectInSecs }})</a>
        }
      </div>
    </div>
  `,
})
export class OAuth2LoginComponent implements OnInit, OnDestroy {
  isLoading = true;
  infoMessage = 'Loading...';
  errorMessage?: string;
  onErrorGoToPath = '/';
  redirectInSecs = 5;

  private intervalId: any;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.auth.login().subscribe({
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
        this.infoMessage = 'An error occurred while logging in:';

        this.intervalId = setInterval(() => {
          this.redirectInSecs -= 1;
          if (this.redirectInSecs === 0) {
            this.router.navigate([this.onErrorGoToPath]);
          }
        }, 1000);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
