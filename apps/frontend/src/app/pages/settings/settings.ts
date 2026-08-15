import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  private settingsService = inject(SettingsService);
  private toastService = inject(ToastService);

  settings = this.settingsService.settings;

  ngOnInit() {
    this.settingsService.loadSettings();
  }

  onToggle(field: 'notificationsEnabled' | 'balanceHidden' | 'twoFactorEnabled') {
    const current = this.settings();
    if (!current) return;

    this.settingsService.updateSettings({ [field]: !current[field] });
    this.toastService.show('Parametr yeniləndi', 'success');
  }

  onLanguageChange(language: 'az' | 'en') {
    const current = this.settings();
    if (!current) return;

    this.settingsService.updateSettings({ language });
    this.toastService.show('Dil yeniləndi', 'success');
  }

  onThemeChange(theme: 'light' | 'dark') {
    const current = this.settings();
    if (!current) return;

    this.settingsService.updateSettings({ theme });
    this.toastService.show('Tema yeniləndi', 'success');
  }

  onInactivityTimeoutChange(minutes: number) {
    const current = this.settings();
    if (!current) return;

    this.settingsService.updateSettings({ inactivityTimeoutMinutes: minutes });
    this.toastService.show('Vaxt aşımı yeniləndi', 'success');
  }
}