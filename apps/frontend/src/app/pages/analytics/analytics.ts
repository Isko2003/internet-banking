import { Component, computed, inject, signal } from '@angular/core';
import { TransactionService } from '../../core/services/transaction.service';
import { AccountService } from '../../core/services/account.service';
import { Transaction } from '../../core/models/transaction.model';
import { Account } from '../../core/models/account.model';
import { forkJoin } from 'rxjs';
import { CategoryPieChart } from '../../shared/components/category-pie-chart/category-pie-chart';
import { MonthlyTrendChart } from '../../shared/components/monthly-trend-chart/monthly-trend-chart';
import { TransactionRow } from '../../shared/components/transaction-row/transaction-row';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-analytics',
  imports: [CategoryPieChart, MonthlyTrendChart, TransactionRow, CurrencyPipe, FormsModule],
  templateUrl: './analytics.html',
  styleUrl: './analytics.css',
})
export class Analytics {
  private transactionService = inject(TransactionService);
  private accountService = inject(AccountService);

  transactions = signal<Transaction[]>([]);
  accounts = signal<Account[]>([]);
  isLoading = signal(false);
  hasError = signal(false);

  selectedAccountId = signal<number | 'all'>('all');
  selectedMonth = signal<string>(this.getCurrentMonth());

  constructor() {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    forkJoin({
      transactions: this.transactionService.getTransactions(),
      accounts: this.accountService.getAccounts(),
    }).subscribe({
      next: ({ accounts, transactions }) => {
        this.accounts.set(accounts);
        this.transactions.set(transactions);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Data yüklənərkən xəta baş verdi:', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }

  getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7);
  }

  filteredTransactions = computed(() => {
    let result = this.transactions();
    const selectedAccount = this.selectedAccountId();

    if (selectedAccount !== 'all') {
      result = result.filter((t) => t.accountId === selectedAccount);
    }

    result = result.filter((t) => t.date && t.date.slice(0, 7) === this.selectedMonth());

    return result;
  });

  previousMonthTransactions = computed(() => {
    const currentMonthStr = this.selectedMonth();
    if (!currentMonthStr) return [];

    const [year, month] = currentMonthStr.split('-').map(Number);
    const date = new Date(year, month - 1);

    date.setMonth(date.getMonth() - 1);

    const prevYear = date.getFullYear();
    const prevMonth = String(date.getMonth() + 1).padStart(2, '0');
    const prevMonthStr = `${prevYear}-${prevMonth}`;

    return this.transactions().filter((t) => t.date && t.date.startsWith(prevMonthStr));
  });

  summary = computed(() => {
    const currentTransactions = this.filteredTransactions();
    const prevTransactions = this.previousMonthTransactions();

    const { totalIncome, totalExpense } = currentTransactions.reduce(
      (acc, t) => {
        const amount = Number(t.amount) || 0;
        if (t.type === 'income') {
          acc.totalIncome += amount;
        } else if (t.type === 'expense') {
          acc.totalExpense += amount;
        }
        return acc;
      },
      { totalIncome: 0, totalExpense: 0 },
    );

    const previousMonthExpense = prevTransactions.reduce((total, t) => {
      return t.type === 'expense' ? total + Number(t.amount) || 0 : total;
    }, 0);

    let expenseChangePercent: number | null = null;

    if (previousMonthExpense > 0) {
      const diff = totalExpense - previousMonthExpense;
      expenseChangePercent = Number(((diff / previousMonthExpense) * 100).toFixed(1));
    }

    return {
      totalIncome,
      totalExpense,
      difference: totalIncome - totalExpense,
      previousMonthExpense,
      expenseChangePercent,
    };
  });

  categoryBreakdown = computed(() => {
    const currentTransactions = this.filteredTransactions();

    const expenses = currentTransactions.filter((t) => t.type === 'expense');

    if (expenses.length === 0) return [];

    const categoryTotals: Record<string, number> = {};
    let totalExpense = 0;

    for (const t of expenses) {
      const amount = Number(t.amount) || 0;
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
      totalExpense += amount;
    }

    return Object.entries(categoryTotals).map(([category, amount]) => {
      const percentage = totalExpense > 0 ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0;

      return {
        category,
        amount,
        percentage,
      };
    });
  });

  topTransactions = computed(() => {
    const currentTransactions = this.filteredTransactions();
    const expenses = currentTransactions.filter((t) => t.type === 'expense');

    return [...expenses].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);
  });

  monthlyTrend = computed(() => {
    const allTransactions = this.transactions();
    const result: { month: string; income: number; expense: number }[] = [];

    const [year, month] = this.selectedMonth().split('-').map(Number);
    const baseDate = new Date(year, month - 1);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setMonth(d.getMonth() - i);

      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthTransactions = allTransactions.filter(
        (t) => t.date && t.date.startsWith(monthKey),
      );

      const { totalIncome, totalExpense } = monthTransactions.reduce(
        (acc, t) => {
          const amount = Number(t.amount) || 0;
          if (t.type === 'income') {
            acc.totalIncome += amount;
          } else if (t.type === 'expense') {
            acc.totalExpense += amount;
          }
          return acc;
        },
        { totalIncome: 0, totalExpense: 0 },
      );

      result.push({
        month: monthKey,
        income: totalIncome,
        expense: totalExpense,
      });
    }
    return result;
  });
}
