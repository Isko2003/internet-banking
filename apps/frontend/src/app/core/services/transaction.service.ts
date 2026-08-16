import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult, Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);

  getTransactions(): Observable<Transaction[]> {
    return this.http
      .get<PaginatedResult<Transaction>>(`${environment.apiUrl}/transactions`, {
        params: { limit: 1000 },
      })
      .pipe(map((res) => res.data));
  }

  getRecent(limit = 5): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions/recent`, {
      params: { limit },
    });
  }

  getTransactionByAccId(accountId: number): Observable<Transaction[]> {
    return this.http
      .get<PaginatedResult<Transaction>>(`${environment.apiUrl}/transactions`, {
        params: { accountId, limit: 1000 },
      })
      .pipe(map((res) => res.data));
  }

  getPaginated(params: {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }): Observable<PaginatedResult<Transaction>> {
    let httpParams = new HttpParams().set('page', params.page).set('limit', params.limit);

    if (params.sort) httpParams = httpParams.set('sort', params.sort);
    if (params.order) httpParams = httpParams.set('order', params.order);

    Object.keys(params).forEach((key) => {
      if (
        !['page', 'limit', 'sort', 'order'].includes(key) &&
        params[key] != null &&
        params[key] !== ''
      ) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<PaginatedResult<Transaction>>(`${environment.apiUrl}/transactions`, {
      params: httpParams,
    });
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${environment.apiUrl}/transactions/${id}`);
  }
}
