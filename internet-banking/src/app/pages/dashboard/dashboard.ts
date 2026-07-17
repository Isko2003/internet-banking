import { Component, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { forkJoin, catchError, finalize, of } from 'rxjs';
import { AccountService } from '../../core/services/account.service';
import { CardService } from '../../core/services/card.service';
import { TransactionService } from '../../core/services/transaction.service';
import { Account } from '../../core/models/account.model';
import { Card } from '../../core/models/card.model';
import { Transaction } from '../../core/models/transaction.model';
import { AuthService } from '../../core/services/auth.service';
import { DashboardPanel } from "../../shared/components/dashboard-panel/dashboard-panel";
import { AccountRow } from "../../shared/components/account-row/account-row";
import { CardRow } from "../../shared/components/card-row/card-row";
import { TransactionRow } from "../../shared/components/transaction-row/transaction-row";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DashboardPanel, AccountRow, CardRow, TransactionRow],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private accountService = inject(AccountService);
  private cardService = inject(CardService);
  private transactionService = inject(TransactionService);
  authService = inject(AuthService);

  displayName = this.authService.currentUser;

  accounts = signal<Account[]>([]);
  cards = signal<Card[]>([]);
  transactions = signal<Transaction[]>([]);

  isLoading = signal(true);
  hasError = signal(false);

  totalBalance = signal(0);

  constructor() {
    this.loadDashboardData();
  }

  private loadDashboardData() {
  this.isLoading.set(true);
  this.hasError.set(false);

  forkJoin({ // bir neçə sorğunu paralel işə salıb hamısı bitəndə birlikdə cavab almaq üçün istifade olunur.
    accounts: this.accountService.getAccounts(),
    cards: this.cardService.getCards(),
    transactions: this.transactionService.getRecent(5),
  })
    .pipe( // 
      catchError(() => {
        this.hasError.set(true);
        return of({
          accounts: [] as Account[],
          cards: [] as Card[],
          transactions: [] as Transaction[],
        });
      }),
      finalize(() => this.isLoading.set(false))
    )
    .subscribe(({ accounts, cards, transactions }) => {
      this.accounts.set(accounts);
      this.cards.set(cards);
      this.transactions.set(transactions);
      this.totalBalance.set(accounts.reduce((sum: number, a: Account) => sum + a.balance, 0));
    });
}
}