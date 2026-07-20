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
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/services/notification.service';
import { AppNotification } from '../../core/models/notification.model';
import { NotificationRow } from "../../shared/components/notification-row/notification-row";
import { ExpenseChart } from '../../shared/components/expense-chart/expense-chart';
import { ExchangeRates } from '../../shared/components/exchange-rates/exchange-rates';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DashboardPanel, AccountRow, CardRow, TransactionRow, RouterLink, NotificationRow, ExpenseChart, ExchangeRates],
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private accountService = inject(AccountService);
  private cardService = inject(CardService);
  private transactionService = inject(TransactionService);
  private notificationService = inject(NotificationService);

  authService = inject(AuthService);

  displayName = this.authService.currentUser;

  accounts = signal<Account[]>([]);
  cards = signal<Card[]>([]);
  transactions = signal<Transaction[]>([]);
  allTransactions = signal<Transaction[]>([]);
  notifications = signal<AppNotification[]>([]);

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
    allTransactions: this.transactionService.getTransactions(),
    notifications: this.notificationService.getNotifications(),
  })
    .pipe(
      catchError(() => {
        this.hasError.set(true);
        return of({
          accounts: [] as Account[],
          cards: [] as Card[],
          transactions: [] as Transaction[],
          allTransactions: [] as Transaction[],
          notifications: [] as AppNotification[],
        });
      }),
      finalize(() => this.isLoading.set(false))
    )
    .subscribe(({ accounts, cards, transactions, notifications, allTransactions }) => {
      this.accounts.set(accounts);
      this.cards.set(cards);
      this.transactions.set(transactions);
      this.allTransactions.set(allTransactions);
      this.notifications.set(notifications);
      this.totalBalance.set(accounts.reduce((sum: number, a: Account) => sum + a.balance, 0));
    });
}
}