import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatError } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, RouterLink, NgIf, MatError, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup;

  constructor(private authService: AuthenticationService, private router: Router, private popup: MatSnackBar) {}

  ngOnInit(): void {
    this.loginForm = new FormGroup({
      username_or_email: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  get username_or_email() {
    return this.loginForm.get("username_or_email")!;
  }

  get password() {
    return this.loginForm.get("password")!;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
    } else {
      this.authService.loginUser(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('User logged in successfully!', response);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Error logging in', err);

          if (err.statusText === "Unauthorized") {
            this.popup.open('Username/email or password is incorrect. Please try again.', 'Close', { duration: 3000 });
          } else {
            this.popup.open('Error logging in. Please try again.', 'Close', { duration: 3000 });
          }
        },
      });
    }
  }
}
