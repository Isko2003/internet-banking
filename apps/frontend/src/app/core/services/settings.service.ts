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

  loadSettings() {
    return this.http.get<UserSettings>(`${environment.apiUrl}/users/me/settings`).subscribe({
      next: (settings) => {
        this.settings.set(settings);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  updateSettings(updates: Partial<UserSettings>) {
    const previousSettings = this.settings();
    this.settings.update((prev) => (prev ? { ...prev, ...updates } : prev));

    this.http
      .patch<UserSettings>(`${environment.apiUrl}/users/me/settings`, updates)
      .subscribe({
        error: () => {
          this.settings.set(previousSettings);
        },
      });
  }
}