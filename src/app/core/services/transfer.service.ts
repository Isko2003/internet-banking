import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Transfer } from "../models/transfer.model";
import { environment } from "../../../environments/environment";
import { TransferTemplate } from "../models/transfer-template.model";

@Injectable({providedIn: 'root'})

export class TransferService {
    private http = inject(HttpClient);

    transferMoney(payload: {
    debitAccountId: number;
    creditAccountId: number;
    amount: number;
    currency: string;
    fee: number;
    finalAmount: number;
    exchangeRate?: number;
    comment: string;
    status: 'completed' | 'failed';
    date: string;
    }): Observable<Transfer> {
        return this.http.post<Transfer>(`${environment.apiUrl}/transfers`, payload)
    }

    saveAsTemplate(payload: {
        debitAccountId: number;
        creditAccountId: number;
        amount: number;
        comment: string;
        name: string;
    }): Observable<TransferTemplate> {
        return this.http.post<TransferTemplate>(`${environment.apiUrl}/templates`, payload)
    }
}