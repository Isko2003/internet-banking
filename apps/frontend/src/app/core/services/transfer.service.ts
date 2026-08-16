import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateTransferPayload, Transfer } from '../models/transfer.model';
import { environment } from '../../../environments/environment';
import { TransferTemplate } from '../models/transfer-template.model';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private http = inject(HttpClient);

  transferMoney(payload: CreateTransferPayload): Observable<Transfer> {
    return this.http.post<Transfer>(`${environment.apiUrl}/transfers`, payload);
  }

  saveAsTemplate(payload: {
    debitAccountId: number;
    creditAccountId: number;
    amount: number;
    comment: string;
    name: string;
  }): Observable<TransferTemplate> {
    return this.http.post<TransferTemplate>(`${environment.apiUrl}/templates`, payload);
  }
}
