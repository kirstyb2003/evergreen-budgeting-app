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

function uniqueValue(field: string, httpConnect: AuthenticationService): AsyncValidatorFn {
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
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, NgIf, NgFor, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatError, MatDividerModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
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
      password: new FormControl('', Validators.required),
      password_confirm: new FormControl('', [Validators.required, passwordMatchValidator("password")]),
      default_currency: new FormControl('', Validators.required), 
      starting_balance: new FormControl('0'),
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

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
    } else {
      this.authService.registerUser(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('User registered successfully!', response);
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
