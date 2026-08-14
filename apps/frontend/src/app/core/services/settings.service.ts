import { HttpClient } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { UserSettings } from '../models/user-settings.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);

  settings = signal<UserSettings | null>(null);

  constructor() {
    effect(() => {
      const current = this.settings();
      if (!current) return;
      document.body.classList.toggle('dark', current.theme === 'dark');
    });
  }

  loadSettings(userId: number) {
    return this.http
      .get<UserSettings[]>(`${environment.apiUrl}/settings?userId=${userId}`)
      .subscribe({
        next: (settings) => {
          this.settings.set(settings[0] ?? null);
        },
        error: (err) => {
          console.error(err);
        },
      });
  }

  updateSettings(id: number, updates: Partial<UserSettings>) {
    const previousSettings = this.settings();
    this.settings.update((prev) => (prev ? { ...prev, ...updates } : prev));

    this.http.patch<UserSettings>(`${environment.apiUrl}/settings/${id}`, updates).subscribe({
      error: () => {
        this.settings.set(previousSettings);
      },
    });
  }
}
