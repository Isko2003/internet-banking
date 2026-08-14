import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-panel',
  imports: [],
  templateUrl: './dashboard-panel.html',
  styleUrl: './dashboard-panel.css',
})
export class DashboardPanel {
  @Input({ required: true }) title!: string;
  @Input() isLoading = false;
  @Input() isEmpty = false;
  @Input() emptyMessage = 'Məlumat tapılmadı';
}
