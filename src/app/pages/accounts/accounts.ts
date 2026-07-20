import { Component, computed, inject, signal } from '@angular/core';
import { Account } from '../../core/models/account.model';
import { AccountService } from '../../core/services/account.service';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CopyToClipboard } from "../../shared/directives/copy-to-clipboard";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-accounts',
  imports: [CurrencyPipe, FormsModule, CopyToClipboard, RouterLink],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts {
  private accountService = inject(AccountService);

  accounts = signal<Account[]>([]);
  isLoading = signal(true);
  hasError = signal(false);
  searchTerm = signal('');
  selectedCurrency = signal<string>('all');
  selectedStatus = signal<string>('all');
  sortDirection = signal<'asc' | 'desc' | null>(null);
  visibleBalances = signal<Set<string | number>>(new Set());

  constructor() {
    this.loadAccountsData();
  }

  filteredAccounts = computed(() => {
    let result = this.accounts();
    const search = this.searchTerm().toLowerCase().trim();
    const selectedCurrency = this.selectedCurrency();
    const selectedStatus = this.selectedStatus();
    const sortDirection = this.sortDirection();

    if (search) {
      result = result.filter((account) => account.name.toLowerCase().includes(search) || account.iban.toLowerCase().includes(search))
    }

    if (selectedCurrency && selectedCurrency !== "all") {
      result = result.filter((account) => account.currency === selectedCurrency);
    }
    
    if(selectedStatus && selectedStatus !== "all") {
      result = result.filter((account) => account.status === selectedStatus)
    }

    if (sortDirection === 'asc') {
      result = [...result].sort((a, b) => a.balance - b.balance);
    } else if (sortDirection === 'desc') {
      result = [...result].sort((a, b) => b.balance - a.balance);
    }

    return result;
  })

  toggleSort() {
    const current = this.sortDirection();
    if (current === null) this.sortDirection.set('desc');
    else if (current === 'desc') this.sortDirection.set('asc');
    else this.sortDirection.set(null);
  }

  toggleBalance(accountId: string | number) {
    this.visibleBalances.update((current) => {
      const updated = new Set(current);
      if(updated.has(accountId)) {
        updated.delete(accountId);
      } else {
        updated.add(accountId);
      }
      return updated;
    })
  }

  isBalanceVisibleFor(accountId: string | number): boolean {
    return this.visibleBalances().has(accountId);
  }

  private loadAccountsData() {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts.set(accounts);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

}
