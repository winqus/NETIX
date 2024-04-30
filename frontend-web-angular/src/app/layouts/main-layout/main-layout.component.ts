import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import content from '../../../assets/i18n/en/content.json';
import { Subscription, ignoreElements } from 'rxjs';
import { LayoutService } from '../../services/layout.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './main-layout.component.html',
})
export class MainLayoutComponent implements OnDestroy, AfterViewInit {
  navbarData = {
    title: content.navbar.title,
  };

  isMobile: boolean = false;
  private subscription: Subscription | undefined;

  constructor(private layoutService: LayoutService) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.subscription = this.layoutService.isMobile$.subscribe((isMobile) => {
        this.isMobile = isMobile;
      });
    }, 0);
  }

  ngOnDestroy() {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
