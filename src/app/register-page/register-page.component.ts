import { Component } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgIf, NgClass } from '@angular/common';
import { currencyList } from '../data-structures/currency-codes';

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

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [NavBarComponent, NavBarComponent, ReactiveFormsModule, NgIf, NgClass],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss'
})
export class RegisterPageComponent {
  currencyList: { name: string; code: string }[] = currencyList;

  registerForm!: FormGroup;

  ngOnInit(): void {
    this.registerForm = new FormGroup({
      username: new FormControl('', Validators.required),
      email: new FormControl('', Validators.required),
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
      console.log('Form Submitted:', this.registerForm.value);
    }
  }
}
