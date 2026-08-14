import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService, CurrentUser } from './auth.service';
import { environment } from '../../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  updateProfile(userId: number, updates: Partial<CurrentUser>): Observable<CurrentUser> {
    return this.http
      .patch<CurrentUser>(`${environment.apiUrl}/users/${userId}`, updates)
      .pipe(tap(() => this.authService.updateCurrentUser(updates)));
  }
}
