import { Component, inject, signal } from '@angular/core';
import { Account } from '../../core/models/account.model';
import { AccountService } from '../../core/services/account.service';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-accounts',
  imports: [CurrencyPipe],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts {
  private accountService = inject(AccountService);

  accounts = signal<Account[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  constructor() {
    this.loadAccountsData();
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
