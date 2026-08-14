import { Injectable, signal } from '@angular/core';
import { ToastMessage } from '../models/toast.model';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  toasts = signal<ToastMessage[]>([]);

  show(message: string, variant: ToastMessage['variant'] = 'info') {
    const id = this.nextId++;
    this.toasts.update((prev) => [...prev, { id, message, variant }]);

    setTimeout(() => this.dismiss(id), 3000);
  }

  dismiss(id: number) {
    this.toasts.update((prev) => prev.filter((t) => t.id !== id));
  }
}
