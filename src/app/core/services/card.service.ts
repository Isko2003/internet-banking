import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Card } from '../models/card.model';

@Injectable({ providedIn: 'root' })
export class CardService {
  private http = inject(HttpClient);

  getCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${environment.apiUrl}/cards`);
  }

  getCardById(id: string): Observable<Card> {
    return this.http.get<Card>(`${environment.apiUrl}/cards/${id}`)
  }

  updateCardStatus(id: number, status: Card['status']): Observable<Card> {
    return this.http.patch<Card>(`${environment.apiUrl}/cards/${id}`, {status});
  }
}