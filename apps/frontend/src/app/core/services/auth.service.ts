import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CurrentUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  birthDate?: string;
  address?: string;
  photoUrl?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: CurrentUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'current_user';

  private _isAuthenticated = signal<boolean>(!!localStorage.getItem(this.TOKEN_KEY));
  isAuthenticated = computed(() => this._isAuthenticated());

  private _currentUser = signal<CurrentUser | null>(
    JSON.parse(localStorage.getItem(this.USER_KEY) || 'null'),
  );
  currentUser = computed(() => this._currentUser());

  updateCurrentUser(updates: Partial<CurrentUser>) {
    const current = this._currentUser();
    if (!current) return;

    const updated = { ...current, ...updates };
    this._currentUser.set(updated);
    localStorage.setItem(this.USER_KEY, JSON.stringify(updated));
  }

  login(email: string, password: string): Observable<CurrentUser> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap((res) => this.persistSession(res)),
        map((res) => res.user),
        catchError((err) => throwError(() => err)),
      );
  }

  register(payload: RegisterPayload): Observable<CurrentUser> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload).pipe(
      tap((res) => this.persistSession(res)),
      map((res) => res.user),
      catchError((err) => throwError(() => err)),
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) => this.persistSession(res)),
        catchError((err) => {
          this.logout();
          return throwError(() => err);
        }),
      );
  }

  private persistSession(res: AuthResponse) {
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, res.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    this._isAuthenticated.set(true);
    this._currentUser.set(res.user);
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._isAuthenticated.set(false);
    this._currentUser.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
}
