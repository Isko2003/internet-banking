import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, combineLatest, switchMap, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExchangeRateResponse } from '../models/exchange-rate.model';

@Injectable({ providedIn: 'root' })
export class ExchangeRateService {
  private http = inject(HttpClient);

  private baseCurrency$ = new BehaviorSubject<string>('AZN');

  private refreshTrigger$ = new BehaviorSubject<void>(undefined);

  rates$: Observable<ExchangeRateResponse> = combineLatest([
    this.baseCurrency$,
    this.refreshTrigger$,
  ]).pipe(
    switchMap(([base]) =>
      this.http.get<ExchangeRateResponse>(`${environment.apiUrl}/rates?base=${base}`)
    ),
    shareReplay(1)
  );

  setBaseCurrency(currency: string) {
    this.baseCurrency$.next(currency);
  }

  refresh() {
    this.refreshTrigger$.next();
  }
}