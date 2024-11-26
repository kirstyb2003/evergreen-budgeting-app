import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  registerUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/register`, userData);
  }

  loginUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/login`, userData);
  }

  getValue(value: string, field: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/find/${field}/${value}`);
  }
}
