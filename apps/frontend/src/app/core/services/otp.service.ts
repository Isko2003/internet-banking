import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class OtpService {
  private http = inject(HttpClient);

  sendOtp(purpose: 'user-transfer'): Observable<{ sessionId: string }> {
    return this.http.post<{ sessionId: string }>(`${environment.apiUrl}/otp/send`, { purpose });
  }

  verifyOtp(sessionId: string, code: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/otp/verify`, {
      sessionId,
      code,
    });
  }
}
