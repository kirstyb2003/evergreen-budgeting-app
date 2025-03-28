import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideRouter, Router } from '@angular/router';
import { from, of, throwError } from 'rxjs';
import { RegisterPageComponent, uniqueValue } from './register-page.component';
import { AuthenticationService } from '../services/authentication.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('RegisterPageComponent', () => {
  let component: RegisterPageComponent;
  let fixture: ComponentFixture<RegisterPageComponent>;
  let authServiceMock: any;
  let snackBarMock: any;

  beforeEach(async () => {
    authServiceMock = {
      registerUser: jasmine.createSpy('registerUser').and.returnValue(of({})),
      getValue: jasmine.createSpy('getValue').and.returnValue(of([])),
      isLoggedIn: jasmine.createSpy('isLoggedIn').and.returnValue(of(false))
    };

    snackBarMock = {
      open: jasmine.createSpy('open'),
    };

    await TestBed.configureTestingModule({
      imports: [
        RegisterPageComponent,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatCheckboxModule,
        BrowserAnimationsModule,
      ],
      providers: [
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: MatSnackBar, useValue: snackBarMock },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialise the form with required controls', () => {
    expect(component.registerForm.contains('username')).toBeTrue();
    expect(component.registerForm.contains('email')).toBeTrue();
    expect(component.registerForm.contains('password')).toBeTrue();
    expect(component.registerForm.contains('password_confirm')).toBeTrue();
    expect(component.registerForm.contains('default_currency')).toBeTrue();
    expect(component.registerForm.contains('starting_balance')).toBeTrue();
    expect(component.registerForm.contains('consent')).toBeTrue();
  });

  describe('Form Controls', () => {
    it('should return the username form control', () => {
      expect(component.username).toBe(component.registerForm.get('username')!);
    });

    it('should return the email form control', () => {
      expect(component.email).toBe(component.registerForm.get('email')!);
    });

    it('should return the password form control', () => {
      expect(component.password).toBe(component.registerForm.get('password')!);
    });

    it('should return the password_confirm form control', () => {
      expect(component.password_confirm).toBe(component.registerForm.get('password_confirm')!);
    });

    it('should return the default_currency form control', () => {
      expect(component.default_currency).toBe(component.registerForm.get('default_currency')!);
    });

    it('should return the starting_balance form control', () => {
      expect(component.starting_balance).toBe(component.registerForm.get('starting_balance')!);
    });

    it('should return the consent form control', () => {
      expect(component.consent).toBe(component.registerForm.get('consent')!);
    });
  });

  describe('Form Validation', () => {
    it('should mark all fields as touched when the form is invalid', () => {
      component.onSubmit();
      expect(component.registerForm.touched).toBeTrue();
    });

    it('should validate password strength', () => {
      component.password.setValue('weakpass');
      expect(component.password.hasError('passwordStrength')).toBeTrue();
    });

    it('should validate password match', () => {
      component.password.setValue('StrongPass1');
      component.password_confirm.setValue('DifferentPass');
      expect(component.password_confirm.hasError('passwordMismatch')).toBeTrue();
    });

    it('should check for unique username', fakeAsync(() => {
      authServiceMock.getValue.and.returnValue(of([{ username: 'existingUser' }]));
      component.username.setValue('existingUser');
      tick(300);
      fixture.detectChanges();
      expect(component.username.hasError('nonUniqueVal')).toBeTrue();
    }));
  });

  describe('uniqueValue Async Validator', () => {
    it('should return null if the control value is empty', fakeAsync(() => {
      const validator = uniqueValue('username', authServiceMock);
      const control = { value: '' } as AbstractControl;
  
      from(validator(control)).subscribe((result: any) => {
        expect(result).toBeNull();
      });
      tick(300);
    }));
  
    it('should return a non-unique error if value already exists', fakeAsync(() => {
      authServiceMock.getValue.and.returnValue(of([{ username: 'existingUser' }]));
      const validator = uniqueValue('username', authServiceMock);
      const control = { value: 'existingUser' } as AbstractControl;
  
      from(validator(control)).subscribe((result: any) => {
        expect(result).toEqual({ nonUniqueVal: true });
      });
      tick(300);
    }));
  
    it('should return null if the value does not exist', fakeAsync(() => {
      authServiceMock.getValue.and.returnValue(of([]));
      const validator = uniqueValue('username', authServiceMock);
      const control = { value: 'newUser' } as AbstractControl;
  
      from(validator(control)).subscribe((result: any) => {
        expect(result).toBeNull();
      });
      tick(300);
    }));
  
    it('should handle HTTP error gracefully and return null', fakeAsync(() => {
      authServiceMock.getValue.and.returnValue(throwError(() => new Error('Network error')));
      const validator = uniqueValue('username', authServiceMock);
      const control = { value: 'troubleUser' } as AbstractControl;
  
      from(validator(control)).subscribe((result: any) => {
        expect(result).toBeNull();
      });
      tick(300);
    }));
  });
  

  describe('Form Submission', () => {
    it('should submit form and navigate to login page on success', () => {
      component.registerForm.setValue({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123',
        password_confirm: 'Password123',
        default_currency: 'USD',
        starting_balance: '1000',
        consent: true,
      });

      component.onSubmit();
      expect(authServiceMock.registerUser).toHaveBeenCalled();
      expect(snackBarMock.open).toHaveBeenCalledWith('Registration successful! Please log in.', 'Close', { duration: 3000 });
    });

    it('should display an error message on registration failure', () => {
      authServiceMock.registerUser.and.returnValue(throwError(() => new Error('Registration failed')));
      component.registerForm.setValue({
        username: 'user',
        email: 'user@example.com',
        password: 'Password123',
        password_confirm: 'Password123',
        default_currency: 'USD',
        starting_balance: '1000',
        consent: true,
      });

      component.onSubmit();
      expect(snackBarMock.open).toHaveBeenCalledWith('Error registering user. Please try again.', 'Close', { duration: 3000 });
    });
  });
});
