import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { currencyList } from '../data-structures/currency-codes';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { catchError, debounceTime, map, Observable, of, switchMap } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatError } from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';

export function passwordStrengthValidator(): ValidatorFn {
  return (control:AbstractControl) : ValidationErrors | null => {

      const value = control.value;

      if (!value) {
          return null;
      }

      const hasUpperCase = /[A-Z]+/.test(value);

      const hasLowerCase = /[a-z]+/.test(value);

      const hasNumeric = /[0-9]+/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;

      return !passwordValid ? {passwordStrength:true}: null;
  }
}

function passwordMatchValidator(passwordControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.parent?.get(passwordControlName)?.value;
    const confirmPassword = control.value;

    if (!password || !confirmPassword) {
      return null;
    }

    // Check if the password and confirm password are the same
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

export function uniqueValue(field: string, httpConnect: AuthenticationService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const value = control.value;

    if (!value) {
      return of(null);
    }

    return of(value).pipe(
      debounceTime(300),
      switchMap(() =>
        httpConnect.getValue(value, field).pipe(
          map((response) => {
            return response.length > 0 ? { nonUniqueVal: true } : null;
          }),
          catchError(() => of(null))
        )
      )
    );
  };
}

@Component({
    selector: 'app-register-page',
    imports: [NavBarComponent, ReactiveFormsModule, NgIf, NgFor, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatError, MatDividerModule, MatCheckboxModule],
    templateUrl: './register-page.component.html',
    styleUrls: ['../form.component.scss']
})
export class RegisterPageComponent implements OnInit{
  currencyList: { name: string; code: string }[] = currencyList;

  registerForm!: FormGroup;

  constructor(private authService: AuthenticationService, private router: Router, private popup: MatSnackBar) {}

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      username: new FormControl('', {
        validators: [Validators.required],
        asyncValidators: [uniqueValue("username", this.authService)],
        updateOn: 'blur',
      }),
      email: new FormControl('', {
        validators: [Validators.required],
        asyncValidators: [uniqueValue("email", this.authService)],
        updateOn: 'blur',
      }),
      password: new FormControl('', [Validators.required, passwordStrengthValidator()]),
      password_confirm: new FormControl('', [Validators.required, passwordMatchValidator("password")]),
      default_currency: new FormControl('', Validators.required), 
      starting_balance: new FormControl('0'),
      consent: new FormControl(false, Validators.required),
    });
  }

  get username() {
    return this.registerForm.get("username")!;
  }

  get email() {
    return this.registerForm.get("email")!;
  }

  get password() {
    return this.registerForm.get("password")!;
  }

  get password_confirm() {
    return this.registerForm.get("password_confirm")!;
  }

  get default_currency() {
    return this.registerForm.get("default_currency")!;
  }

  get starting_balance() {
    return this.registerForm.get("starting_balance")!;
  }

  get consent() {
    return this.registerForm.get("consent")!;
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
    } else {
      this.authService.registerUser(this.registerForm.value).subscribe({
        next: (_response) => {
          this.router.navigate(['/login']);
          this.popup.open('Registration successful! Please log in.', 'Close', { duration: 3000 });
        },
        error: (err) => {
          console.error('Error registering user', err);
          this.popup.open('Error registering user. Please try again.', 'Close', { duration: 3000 });
        },
      });
    }
  }
}
