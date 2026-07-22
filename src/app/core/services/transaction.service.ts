import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginatedResult, Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);

  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions`);
  }

  getRecent(limit = 5): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions?_sort=date&_order=desc&_limit=${limit}`);
  }

  getTransactionByAccId(accountId: number): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions?accountId=${accountId}&_sort=date&_order=desc`);
  }

  getPaginated(params: {
    page: number;
    limit: number;
    sort?: string;
    order?: 'asc' | 'desc';
    [key: string]: any;
  }): Observable<PaginatedResult<Transaction>> {
    let httpParams = new HttpParams()
    .set('_page', params.page)
    .set('_limit', params.limit);

    if(params.sort) httpParams = httpParams.set('_sort', params.sort);
    if(params.order) httpParams = httpParams.set("_order", params.order);

    Object.keys(params).forEach((key) => {
      if(!['page', 'limit', 'sort', 'order'].includes(key) && params[key] != null && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.get<Transaction[]>(`${environment.apiUrl}/transactions`, {
      params: httpParams,
      observe: 'response',
    })
    .pipe(
      map((response) => ({
        data: response.body || [],
        totalCount: Number(response.headers.get('X-Total-Count')) || 0,
      }))
    );
  }

}