import { Component, computed, inject, signal } from '@angular/core';
import { TemplateService } from '../../core/services/template.service';
import { AccountService } from '../../core/services/account.service';
import { Router } from '@angular/router';
import { TransferTemplate } from '../../core/models/transfer-template.model';
import { finalize, forkJoin } from 'rxjs';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { FormsModule } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-templates',
  imports: [ConfirmDialog, FormsModule, CurrencyPipe],
  templateUrl: './templates.html',
  styleUrl: './templates.css',
})
export class Templates {
  private templateService = inject(TemplateService);
  private accountService = inject(AccountService);
  private router = inject(Router);

  templates = signal<TransferTemplate[]>([]);
  accountsMap = signal<Map<number, string>>(new Map());
  isLoading = signal(false);
  hasError = signal(false);

  searchTerm = signal('');
  sortDirection = signal<'asc' | 'desc' | null>(null);

  filteredTemplates = computed(() => {
    let result = this.templates();
    const search = this.searchTerm().toLowerCase().trim();
    const sortDirection = this.sortDirection();

    if (search) {
      result = result.filter(
        (temp) =>
          temp.name.toLowerCase().includes(search) || temp.comment.toLowerCase().includes(search),
      );
    }

    if (sortDirection === 'asc') {
      result = [...result].sort((a, b) => a.amount - b.amount);
    } else if (sortDirection === 'desc') {
      result = [...result].sort((a, b) => b.amount - a.amount);
    }

    return result;
  });

  templateToDelete = signal<TransferTemplate | null>(null);
  isConfirmOpen = signal(false);
  isDeleting = signal(false);

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      accounts: this.accountService.getAccounts(),
      templates: this.templateService.getTemplates(),
    }).subscribe({
      next: ({ accounts, templates }) => {
        const map = new Map<number, string>();
        accounts.forEach((acc) => map.set(acc.id, acc.name));
        this.accountsMap.set(map);
        this.templates.set(templates);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Data yüklənərkən xəta baş verdi:', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  onDeleteClick(template: TransferTemplate) {
    this.templateToDelete.set(template);
    this.isConfirmOpen.set(true);
  }

  onConfirmDelete() {
    this.isConfirmOpen.set(false);
    const template = this.templateToDelete();
    if (!template) return;

    const previousTemplates = this.templates();

    this.templates.update((prev) => prev.filter((t) => t.id !== template.id));

    this.isDeleting.set(true);

    this.templateService
      .deleteTemplate(template.id)
      .pipe(finalize(() => this.isDeleting.set(false)))
      .subscribe({
        error: (err) => {
          console.error('Silinmə zamanı xəta baş verdi:', err);
          this.templates.set(previousTemplates);
        },
      });
  }

  onCancelDelete() {
    this.isConfirmOpen.set(false);
  }

  onToggleFavorite(template: TransferTemplate) {
    const previousTemplates = this.templates();

    this.templates.update((prev) =>
      prev.map((t) => (t.id === template.id ? { ...t, isFavorite: !t.isFavorite } : t)),
    );

    this.templateService
      .updateTemplate(template.id, { isFavorite: !template.isFavorite })
      .subscribe({
        error: (err) => {
          console.error('Favorit statusu dəyişdirilərkən xəta baş verdi:', err);
          this.templates.set(previousTemplates);
        },
      });
  }

  onUseTemplate(template: TransferTemplate) {
    this.router.navigate(['/transfers'], { state: { template } });
  }

  toggleSort() {
    const current = this.sortDirection();
    if (current === null) this.sortDirection.set('desc');
    else if (current === 'desc') this.sortDirection.set('asc');
    else this.sortDirection.set(null);
  }

  getAccountName(accountId: number): string {
    return this.accountsMap().get(accountId) || `Hesab #${accountId}`;
  }
}
