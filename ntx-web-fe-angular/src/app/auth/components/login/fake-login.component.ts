import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-fake-login',
  standalone: true,
  imports: [],
  template: `
    <div class="container mx-auto p-8 flex justify-center items-center h-screen">
      <div class="text-center">
        @if (isLoading) {
          <div class="flex justify-center mt-4">
            <progress class="progress progress-error w-56"></progress>
          </div>
        }

        <p class="text-sm mt-4 text-base-content">
          {{ infoMessage }}
        </p>
      </div>
    </div>
  `,
})
export class FakeLoginComponent implements OnInit {
  isLoading = true;
  infoMessage = 'Logging in with fake details...';

  constructor(private readonly auth: AuthService) {}

  ngOnInit(): void {
    this.auth.login();
  }
}
