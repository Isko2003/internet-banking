import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface CurrentUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';

  private _isAuthenticated = signal<boolean>(!!localStorage.getItem(this.TOKEN_KEY));
  isAuthenticated = computed(() => this._isAuthenticated());

  private _currentUser = signal<CurrentUser | null>(JSON.parse(localStorage.getItem(this.USER_KEY) || 'null'));
  currentUser = computed(() => this._currentUser());

  login(email: string, password: string): Observable<CurrentUser> {
    return this.http.get<User[]>(`${environment.apiUrl}/users?email=${email}`).pipe(
      map((users) => {
        const user = users[0];
        if (!user || user.password !== password) {
          throw new Error('Invalid credentials');
        }
        const { password: _pw, ...safeUser } = user;
        return safeUser;
      }),
      tap((user) => {
        const mockToken = btoa(`${user.id}:${Date.now()}`);
        localStorage.setItem(this.TOKEN_KEY, mockToken);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this._isAuthenticated.set(true);
        this._currentUser.set(user);
      }),
      catchError((err) => throwError(() => err))
    );
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
}