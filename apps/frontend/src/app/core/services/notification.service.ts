import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private _notifications = signal<AppNotification[]>([]);
  public notifications = computed(() => this._notifications());

  unreadCount = computed(() => this._notifications().filter((n) => !n.read).length);

  loadNotifications() {
    return this.http
      .get<AppNotification[]>(`${environment.apiUrl}/notifications`)
      .subscribe((notifications) => this._notifications.set(notifications));
  }

  markAsRead(id: number) {
    const prevNotifications = this._notifications();

    this._notifications.update((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

    this.http
      .patch<AppNotification>(`${environment.apiUrl}/notifications/${id}`, { read: true })
      .subscribe({
        error: () => {
          this._notifications.set(prevNotifications);
        },
      });
  }

  markAllAsRead() {
    const prevNotifications = this._notifications();
    const unreadIds = prevNotifications.filter((n) => !n.read).map((n) => n.id);

    if (unreadIds.length === 0) return;

    this._notifications.update((prev) => prev.map((n) => ({ ...n, read: true })));

    const requests = unreadIds.map((id) =>
      this.http.patch<AppNotification>(`${environment.apiUrl}/notifications/${id}`, { read: true }),
    );

    forkJoin(requests).subscribe({
      error: () => {
        this._notifications.set(prevNotifications);
      },
    });
  }

  deleteNotification(id: number) {
    const prevNotifications = this._notifications();

    this._notifications.update((prev) => prev.filter((n) => n.id !== id));

    this.http.delete<{ message: string }>(`${environment.apiUrl}/notifications/${id}`).subscribe({
      error: () => {
        this._notifications.set(prevNotifications);
      },
    });
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${environment.apiUrl}/notifications`);
  }
}
