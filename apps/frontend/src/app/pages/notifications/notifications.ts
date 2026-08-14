import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NotificationService } from '../../core/services/notification.service';
import { ToastService } from '../../core/services/toast.service';
import { NotificationType } from '../../core/models/notification.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notifications',
  imports: [FormsModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class Notifications implements OnInit {
  private notificationService = inject(NotificationService);
  private toastService = inject(ToastService);

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;

  typeFilter = signal<NotificationType | 'all'>('all');
  readFilter = signal<'all' | 'unread' | 'read'>('all');

  filteredNotifications = computed(() => {
    const list = this.notifications();
    const type = this.typeFilter();
    const read = this.readFilter();

    return list.filter((n) => {
      const matchesType = type === 'all' || n.type === type;
      const matchesRead =
        read === 'all' || (read === 'unread' && !n.read) || (read === 'read' && n.read);

      return matchesType && matchesRead;
    });
  });

  ngOnInit() {
    this.notificationService.loadNotifications();
  }

  onMarkAsRead(id: number) {
    this.notificationService.markAsRead(id);
    this.toastService.show('Bildiriş oxunmuş kimi qeyd edildi', 'success');
  }

  onMarkAllAsRead() {
    if (this.unreadCount() === 0) return;

    this.notificationService.markAllAsRead();
    this.toastService.show('Bütün bildirişlər oxunmuş kimi qeyd edildi', 'success');
  }

  onDelete(id: number) {
    this.notificationService.deleteNotification(id);
    this.toastService.show('Bildiriş silindi', 'info');
  }
}
