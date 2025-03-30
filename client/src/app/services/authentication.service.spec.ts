import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthenticationService } from './authentication.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { WindowService } from './window.service';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let httpMock: HttpTestingController;
  let windowServiceMock: jasmine.SpyObj<WindowService>;

  beforeEach(() => {
    windowServiceMock = jasmine.createSpyObj('WindowService', ['reload']);

    TestBed.configureTestingModule({
      imports: [MatSnackBarModule],
      providers: [
        AuthenticationService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: WindowService, useValue: windowServiceMock },
      ],
    });
    service = TestBed.inject(AuthenticationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should register a user', () => {
    const mockUserData = { username: 'testuser', password: 'password123' };
    const mockResponse = { message: 'User registered successfully' };

    service.registerUser(mockUserData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/users/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should log in a user and store session data', () => {
    const mockUserData = { username: 'testuser', password: 'password123' };
    const mockResponse = { token: 'mockToken', user: { id: 1, username: 'testuser' } };

    service.loginUser(mockUserData).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      expect(sessionStorage.getItem('currentUser')).toEqual(JSON.stringify(mockResponse.user));
      expect(sessionStorage.getItem('token')).toEqual(mockResponse.token);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/users/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should retrieve a value by field', () => {
    const mockField = 'username';
    const mockValue = 'testuser';
    const mockResponse = { id: 1, username: 'testuser' };

    service.getValue(mockValue, mockField).subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/users/find/${mockField}/${mockValue}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should log out a user and clear session data', () => {
    spyOn(service['router'], 'navigate');

    sessionStorage.setItem('currentUser', JSON.stringify({ id: 1, username: 'testuser' }));
    sessionStorage.setItem('token', 'mockToken');

    service.logout();

    expect(sessionStorage.getItem('currentUser')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(service['router'].navigate).toHaveBeenCalledWith(['/login']);
    expect(windowServiceMock.reload).toHaveBeenCalled(); // Verify the service was called
  });

  it('should check if a user is logged in', () => {
    service['currentUserSubject'].next({ id: 1, username: 'testuser' });
    expect(service.isLoggedIn()).toBeTrue();

    service['currentUserSubject'].next(null);
    expect(service.isLoggedIn()).toBeFalse();
  });

  it('should display a session expired popup', () => {
    spyOn(service['popup'], 'open');
    service.displayExpiredTokenPopup();
    expect(service['popup'].open).toHaveBeenCalledWith(
      'Your session has expired. You have been logged out.',
      'Close',
      { duration: 5000, verticalPosition: 'top' }
    );
  });
});
