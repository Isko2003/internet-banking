import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${environment.apiUrl}/accounts`);
  }

  getAccountById(id: string): Observable<Account> {
    return this.http.get<Account>(`${environment.apiUrl}/accounts/${id}`);
  }

}