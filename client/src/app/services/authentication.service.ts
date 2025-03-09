import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient, private popup: MatSnackBar, private router: Router) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(sessionStorage.getItem('currentUser') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, userData);
  }

  loginUser(userData: any): Observable<any> {
    return this.http.post<{ token: string; user: any }>(`${this.apiUrl}/users/login`, userData).pipe(
      map(response => {
        sessionStorage.setItem('currentUser', JSON.stringify(response.user));
        sessionStorage.setItem('token', response.token);
        this.currentUserSubject.next(response.user);
        return response;
      })
    );
  }

  getValue(value: string, field: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/find/${field}/${value}`);
  }

  logout() {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  displayExpiredTokenPopup() {
    this.popup.open('Your session has expired. You have been logged out.', 'Close', {
      duration: 5000,
      verticalPosition: 'top',
    });
  }
}
