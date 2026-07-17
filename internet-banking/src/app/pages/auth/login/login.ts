import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  failedAttempts = signal(0);
  isLocked = signal(false);
  lockoutSeconds = signal(0);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
    rememberMe: false,
  });

  private passwordStrengthValidator(control: AbstractControl) {
    const value = control.value || '';
    const hasLetter = /[a-zA-Z]/.test(value);
    const hasDigit = /[0-9]/.test(value);
    if (!value) return null;
    return hasLetter && hasDigit ? null : { weakPassword: true };
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.invalid || this.isLocked()) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    setTimeout(() => {
      const { email, password } = this.loginForm.value;

      if (email === 'test@mybank.com' && password === "Test1234") {
        this.authService.login('mock-jwt-token');
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      } else {
        this.isLoading.set(false);
        this.errorMessage.set('Email və ya şifrə yanlışdır');
        this.failedAttempts.update(v => v + 1);

        if (this.failedAttempts() >= 3) {
          this.startLockout();
        }
      }
    }, 1000)
  }

  private startLockout() {
    this.isLocked.set(true);
    this.lockoutSeconds.set(30);

    const interval = setInterval(() => {
      this.lockoutSeconds.update(v => v - 1);
      if(this.lockoutSeconds() <= 0) {
        clearInterval(interval);
        this.isLocked.set(false);
        this.failedAttempts.set(0);
      }
    }, 1000);
  }
}
