import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';

  private _isAuthenticated = signal<boolean>(!!localStorage.getItem(this.TOKEN_KEY));
  isAuthenticated = computed(() => this._isAuthenticated());

  login(token: string) {
    localStorage.setItem(this.TOKEN_KEY, token);
    this._isAuthenticated.set(true);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    this._isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}