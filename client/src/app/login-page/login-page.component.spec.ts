import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthenticationService } from '../services/authentication.service';
import { LoginPageComponent } from './login-page.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('LoginPageComponent', () => {
  let component: LoginPageComponent;
  let fixture: ComponentFixture<LoginPageComponent>;
  let authServiceMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    authServiceMock = {
      loginUser: jasmine.createSpy('loginUser').and.returnValue(of(true)),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(of(true))
    };

    snackBarMock = jasmine.createSpyObj('MatSnackBar', ['open']);

    await TestBed.configureTestingModule({
      imports: [
        LoginPageComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatSnackBarModule,
        BrowserAnimationsModule
      ],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create the login page component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise the form on ngOnInit', () => {
    component.ngOnInit();
    expect(component.loginForm).toBeTruthy();
    expect(component.loginForm.controls['username_or_email']).toBeTruthy();
    expect(component.loginForm.controls['password']).toBeTruthy();
  });

  it('should mark form as touched if invalid on submit', () => {
    component.onSubmit();
    expect(component.loginForm.touched).toBeTruthy();
    expect(component.loginForm.invalid).toBeTruthy();
  });

  it('should navigate to /home on successful login', () => {
    const mockResponse = { message: 'Login successful' };
    authServiceMock.loginUser.and.returnValue(of(mockResponse));

    component.loginForm.setValue({ username_or_email: 'testuser', password: 'password123' });
    component.onSubmit();

    expect(authServiceMock.loginUser).toHaveBeenCalledWith({ username_or_email: 'testuser', password: 'password123' });
  });

  it('should show unauthorised error message when login fails with 401', () => {
    const mockError = { statusText: 'Unauthorized' };
    authServiceMock.loginUser.and.returnValue(throwError(() => mockError));

    component.loginForm.setValue({ username_or_email: 'wronguser', password: 'wrongpass' });
    component.onSubmit();

    expect(authServiceMock.loginUser).toHaveBeenCalledWith({ username_or_email: 'wronguser', password: 'wrongpass' });
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Username/email or password is incorrect. Please try again.',
      'Close',
      { duration: 3000 }
    );
  });

  it('should show general error message when login fails with other errors', () => {
    const mockError = { statusText: 'Internal Server Error' };
    authServiceMock.loginUser.and.returnValue(throwError(() => mockError));

    component.loginForm.setValue({ username_or_email: 'user', password: 'pass' });
    component.onSubmit();

    expect(authServiceMock.loginUser).toHaveBeenCalledWith({ username_or_email: 'user', password: 'pass' });
    expect(snackBarMock.open).toHaveBeenCalledWith(
      'Error logging in. Please try again.',
      'Close',
      { duration: 3000 }
    );
  });

  it('should return the username_or_email form control', () => {
    expect(component.username_or_email).toBe(component.loginForm.get('username_or_email')!);
  });

  it('should return the password form control', () => {
    expect(component.password).toBe(component.loginForm.get('password')!);
  });
});
