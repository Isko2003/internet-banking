import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Transfer } from "../models/transfer.model";
import { environment } from "../../../environments/environment";

@Injectable({providedIn: 'root'})

export class TransferService {
    private http = inject(HttpClient);

    transferMoney(payload: {
        debitAccountId: number;
        creaditAccountId: number;
        amount: number;
        comment: string;
    }): Observable<Transfer> {
        return this.http.post<Transfer>(`${environment.apiUrl}/transfers`, payload)
    }
}