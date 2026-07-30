import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TransactionService } from '../../core/services/transaction.service';
import { Transaction } from '../../core/models/transaction.model';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountService } from '../../core/services/account.service';
import { Pagination } from '../../shared/components/pagination/pagination';
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { RelativeDatePipe } from '../../shared/pipes/relative-date-pipe';
import { HighlightAmount } from '../../shared/directives/highlight-amount';

@Component({
  selector: 'app-transactions',
  imports: [ReactiveFormsModule, Pagination, RouterLink, RelativeDatePipe, HighlightAmount],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private destroyRef = inject(DestroyRef);
  private accountService = inject(AccountService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  accountsMap = signal<Map<number, string>>(new Map());
  transactions = signal<Transaction[]>([]);
  totalCount = signal(0);
  isLoading = signal(true);
  hasError = signal(false);

  currentPage = signal(1);
  pageSize = 10;

  filterForm = this.fb.group({
    search: [''],
    status: ['all'],
    category: ['all'],
    dateFrom: [''],
    dateTo: [''],
    minAmount: [''],
    maxAmount: [''],
  });

  constructor() {
    const params = this.route.snapshot.queryParamMap;

    this.filterForm.patchValue({
      search: params.get('search') || '',
      status: params.get('status') || 'all',
      category: params.get('category') || 'all',
      dateFrom: params.get('dateFrom') || '',
      dateTo: params.get('dateTo') || '',
      minAmount: params.get('minAmount') || '',
      maxAmount: params.get('maxAmount') || '',
    }, { emitEvent: false });

    this.currentPage.set(Number(params.get('page')) || 1);

    this.accountService.getAccounts().subscribe((accounts) => {
      const map = new Map(accounts.map((a) => [a.id, a.name]));
      this.accountsMap.set(map);
    })
    this.filterForm.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      switchMap((values) => {
        this.isLoading.set(true);
        this.currentPage.set(1);
        this.updateUrl(values, 1);
        return this.transactionService.getPaginated({
          page: 1,
          limit: this.pageSize,
          search: values.search,
          status: values.status !== "all" ? values.status : undefined,
          category: values.category !== "all" ? values.category : undefined,
          dateFrom: values.dateFrom || undefined,
          dateTo: values.dateTo || undefined,
          minAmount: values.minAmount || undefined,
          maxAmount: values.maxAmount || undefined,
        });
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (result) => {
        this.transactions.set(result.data);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
    
    this.loadTransactions();
  }

  private loadTransactions() {
    this.isLoading.set(true);
    const values = this.filterForm.value;
    this.transactionService.getPaginated({
      page: this.currentPage(),
      limit: this.pageSize,
      search: values.search,
      status: values.status !== 'all' ? values.status : undefined,
      category: values.category !== 'all' ? values.category : undefined,
      dateFrom: values.dateFrom || undefined,
      dateTo: values.dateTo || undefined,
      minAmount: values.minAmount || undefined,
      maxAmount: values.maxAmount || undefined,
    }).subscribe({
      next: (result) => {
        this.transactions.set(result.data);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    })
  }

  private updateUrl(values: any, page: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: values.search || null,
        status: values.status !== 'all' ? values.status : null,
        category: values.category !== 'all' ? values.category : null,
        dateFrom: values.dateFrom || null,
        dateTo: values.dateTo || null,
        minAmount: values.minAmount || null,
        maxAmount: values.maxAmount || null,
        page: page > 1 ? page : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  getAccountName(accountId: number): string {
    return this.accountsMap().get(accountId) || `Hesab #${accountId}`;
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.isLoading.set(true);
    const values = this.filterForm.value;
    this.updateUrl(values, page);
    this.transactionService.getPaginated({
      page,
      limit: this.pageSize,
      search: values.search,
      status: values.status !== "all" ? values.status : undefined,
      category: values.category !== "all" ? values.category : undefined,
      dateFrom: values.dateFrom || undefined,
      dateTo: values.dateTo || undefined,
      minAmount: values.minAmount || undefined,
      maxAmount: values.maxAmount || undefined,
    }).subscribe({
      next: (result) => {
        this.transactions.set(result.data);
        this.totalCount.set(result.totalCount);
        this.isLoading.set(false)
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    })
  }

  goToDetail(id: number) {
    this.router.navigate(['/transactions', id]);
  }

  onResetFilters() {
    this.filterForm.reset({
      search: '',
      status: 'all',
      category: 'all',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: "",
    })
  }
}
