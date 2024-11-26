import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthenticationService } from './authentication.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    // Check if the user is logged in
    return this.authService.currentUser.pipe(
      map(user => {
        if (user) {
          // User is logged in, allow access
          return true;
        } else {
          // User is not logged in, redirect to login page
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}
