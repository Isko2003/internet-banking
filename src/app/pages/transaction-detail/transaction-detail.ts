import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';
import { finalize } from 'rxjs';
import { RouterLink } from "@angular/router";
import { AccountService } from '../../core/services/account.service';
import { CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-transaction-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './transaction-detail.html',
  styleUrl: './transaction-detail.css',
})
export class TransactionDetail implements OnInit {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);

  @Input() id!: string;

  transaction = signal<Transaction | null>(null);
  isLoading = signal(true);
  hasError = signal(false);
  accountsMap = signal<Map<number, string>>(new Map());

  ngOnInit() {
    this.accountService.getAccounts().subscribe((accounts) => {
      this.accountsMap.set(new Map(accounts.map((a) => [a.id, a.name])));
    });

    this.transactionService.getTransactionById(this.id).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (transaction) => this.transaction.set(transaction),
      error: () => this.hasError.set(true),
    });
  }

    getAccountName(accountId: number): string {
    return this.accountsMap().get(accountId) || `Hesab #${accountId}`;
  }
}
