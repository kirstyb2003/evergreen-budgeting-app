import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [NavBarComponent, RouterLink],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss'
})
export class HomePageComponent {

  constructor(private authService: AuthenticationService, private router: Router) {}
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
