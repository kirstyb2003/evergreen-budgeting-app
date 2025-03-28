import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NavBarComponent } from './nav-bar.component';
import { AuthenticationService } from '../services/authentication.service';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NavBarComponent', () => {
  let component: NavBarComponent;
  let fixture: ComponentFixture<NavBarComponent>;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(true),
      logout: jasmine.createSpy('logout')
    };

    routerMock = {
      url: '/home',
      navigate: jasmine.createSpy('navigate'),
      navigateByUrl: jasmine.createSpy('navigateByUrl')
    };

    await TestBed.configureTestingModule({
      imports: [ NavBarComponent ],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        provideRouter([])
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise currentUrl from router and loggedIn from authService', () => {
    expect(component.currentUrl).toBe('/');
    expect(component.loggedIn).toBe(true);
  });

  it('should call openMenu on mouseEnter', () => {
    const trigger = { openMenu: jasmine.createSpy('openMenu') };
    component.mouseEnter(trigger);
    expect(trigger.openMenu).toHaveBeenCalled();
  });

  it('should clear timeout on mouseEnter if one exists', () => {
    const trigger = { openMenu: jasmine.createSpy('openMenu') };
    component.timedOutCloser = setTimeout(() => {}, 1000);
    spyOn(window, 'clearTimeout');
    component.mouseEnter(trigger);
    expect(clearTimeout).toHaveBeenCalledWith(component.timedOutCloser);
    expect(trigger.openMenu).toHaveBeenCalled();
  });

  it('should call closeMenu on mouseLeave after timeout', fakeAsync(() => {
    const trigger = { closeMenu: jasmine.createSpy('closeMenu') };
    component.mouseLeave(trigger);
    tick(50);
    expect(trigger.closeMenu).toHaveBeenCalled();
  }));

  it('should logout and navigate to /login when logout is called', () => {
    component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should render both nav-area-web and nav-area-phone elements', () => {
    const webArea = fixture.nativeElement.querySelector('.nav-area-web');
    const phoneArea = fixture.nativeElement.querySelector('.nav-area-phone');
    expect(webArea).toBeTruthy();
    expect(phoneArea).toBeTruthy();
  });
});

