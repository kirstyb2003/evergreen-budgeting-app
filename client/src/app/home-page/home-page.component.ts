import { Component, OnInit } from '@angular/core';
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
export class HomePageComponent implements OnInit{
  currentUser!: any;
  currentUrl!: String;

  constructor(private authService: AuthenticationService, private router: Router) {
    this.currentUrl = this.router.url;
  }

  ngOnInit(): void {
      this.authService.currentUser.subscribe(user => {
        this.currentUser = user.user;
        console.log(this.currentUser);
      })
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
