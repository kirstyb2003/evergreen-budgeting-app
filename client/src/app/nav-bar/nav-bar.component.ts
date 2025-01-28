import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationService } from '../services/authentication.service';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-nav-bar',
    imports: [RouterLink, MatButtonModule, MatMenuModule, MatIconModule, RouterLinkActive, NgIf],
    templateUrl: './nav-bar.component.html',
    styleUrl: './nav-bar.component.scss'
})
export class NavBarComponent {
  timedOutCloser: any;

  currentUrl: string;
  loggedIn: boolean;

  constructor(private authService: AuthenticationService, private router: Router) {
    this.currentUrl = this.router.url;
    this.loggedIn = this.authService.isLoggedIn();
  }

  mouseEnter(trigger: { openMenu: () => void; }) {
    if (this.timedOutCloser) {
      clearTimeout(this.timedOutCloser);
    }
    trigger.openMenu();
  }

  mouseLeave(trigger: { closeMenu: () => void; }) {
    this.timedOutCloser = setTimeout(() => {
      trigger.closeMenu();
    }, 50);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
