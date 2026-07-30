import { Component, Input } from '@angular/core';
import { AppNotification } from '../../../core/models/notification.model';

@Component({
  selector: 'app-notification-row',
  standalone: true,
  templateUrl: './notification-row.html',
})
export class NotificationRow {
  @Input({ required: true }) notification!: AppNotification;
}