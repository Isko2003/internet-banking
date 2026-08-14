import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserTransfer } from '../models/transfer-to-user-model';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class UserTransferService {
  private http = inject(HttpClient);

  sendTransfer(payload: Omit<UserTransfer, 'id'>): Observable<UserTransfer> {
    return this.http.post<UserTransfer>(`${environment.apiUrl}/userTransfers`, payload);
  }
}
