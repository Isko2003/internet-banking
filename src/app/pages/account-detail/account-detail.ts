import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../core/models/account.model';
import { RouterLink } from "@angular/router";
import { CurrencyPipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';
import { TransactionRow } from "../../shared/components/transaction-row/transaction-row";

@Component({
  selector: 'app-account-detail',
  imports: [RouterLink, CurrencyPipe, TransactionRow],
  templateUrl: './account-detail.html',
  styleUrl: './account-detail.css',
})
export class AccountDetail implements OnInit {
  private accountService = inject(AccountService);
  private transactionService = inject(TransactionService);

  @Input() id!: string;

  account = signal<Account | null>(null);
  transactions = signal<Transaction[]>([]);
  isLoading = signal(true);
  hasError = signal(false);

  ngOnInit() {
    forkJoin({
      account: this.accountService.getAccountById(this.id),
      transactions: this.transactionService.getTransactionByAccId(Number(this.id)),
    }).subscribe({
      next: ({account, transactions}) => {
        this.account.set(account);
        this.transactions.set(transactions);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    })
  }

  onDownloadStatement() {
    console.log('Çıxarış yüklənir');
  }

  totalIncoming = computed(() => {
    return this.transactions()
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  });

  totalOutgoing = computed(() => {
    return this.transactions()
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  })
}
