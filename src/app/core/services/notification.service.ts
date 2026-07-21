import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${environment.apiUrl}/notifications`);
  }
}