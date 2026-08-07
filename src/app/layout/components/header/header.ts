import { Component, computed, EventEmitter, inject, Output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  @Output() menuToggle = new EventEmitter<void>();
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  currentUser = this.authService.currentUser;
  unreadCount = this.notificationService.unreadCount;

  displayName = computed(() => {
    const user = this.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'User';
  });

  onMenuClick() {
    this.menuToggle.emit();
  }

  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  constructor() {
    this.notificationService.loadNotifications();
  }
}
