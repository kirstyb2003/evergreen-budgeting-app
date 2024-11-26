import { Component, OnInit } from '@angular/core';
import { NavBarComponent } from '../nav-bar/nav-bar.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatError } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [NavBarComponent, ReactiveFormsModule, RouterLink, NgIf, MatError, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss'
})
export class LoginPageComponent implements OnInit {
  loginForm!: FormGroup;

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
      console.log('Form Submitted:', this.loginForm.value);
    }
  }
}
