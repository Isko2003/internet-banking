import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';
import { Sidebar } from '../sidebar/sidebar';
import { Toast } from '../../../shared/components/toast/toast';
import { SettingsService } from '../../../core/services/settings.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Header, Sidebar, Footer, Toast],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  private settingsService = inject(SettingsService);
  sidebarOpen = signal(true);

  constructor() {
    this.settingsService.loadSettings();
  }

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }
}
