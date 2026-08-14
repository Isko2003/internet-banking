import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentProvider } from '../models/payment-provider.model';
import { environment } from '../../../environments/environment';
import { DebtCheckResult, Payment } from '../models/payment.model';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private http = inject(HttpClient);

  getProviders(category: string): Observable<PaymentProvider[]> {
    return this.http.get<PaymentProvider[]>(`${environment.apiUrl}/providers?category=${category}`);
  }

  checkDebt(providerId: number, fields: Record<string, string>): Observable<DebtCheckResult> {
    return this.http.post<DebtCheckResult>(`${environment.apiUrl}/payments/check`, {
      providerId,
      fields,
    });
  }

  pay(payload: Omit<Payment, 'id' | 'transactionId'>): Observable<Payment> {
    return this.http.post<Payment>(`${environment.apiUrl}/payments/pay`, payload);
  }
}
