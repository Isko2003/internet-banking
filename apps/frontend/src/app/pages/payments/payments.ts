import { Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { PaymentService } from '../../core/services/payment.service';
import { PAYMENT_CATEGORIES, PaymentCategoryConfig } from '../../core/constants/payment-categories';
import { Account } from '../../core/models/account.model';
import { PaymentProvider } from '../../core/models/payment-provider.model';
import { Payment } from '../../core/models/payment.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { azPhoneValidator } from '../../core/validators/az-phone.validator';

@Component({
  selector: 'app-payments',
  imports: [ReactiveFormsModule, FormsModule, ConfirmDialog, RouterLink],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private paymentService = inject(PaymentService);

  categories = PAYMENT_CATEGORIES;

  readonly steps = [
    { key: 'category', label: 'Kateqoriya' },
    { key: 'provider', label: 'Provayder' },
    { key: 'form', label: 'Məlumatlar' },
  ] as const;

  step = signal<'category' | 'provider' | 'form' | 'success'>('category');

  accounts = signal<Account[]>([]);
  providers = signal<PaymentProvider[]>([]);
  isLoadingProviders = signal(false);

  selectedCategory = signal<PaymentCategoryConfig | null>(null);
  selectedProvider = signal<PaymentProvider | null>(null);
  debitAccountId = signal<number | null>(null);

  fieldsArray = this.fb.array<FormControl<string>>([]);

  manualAmount = new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]);

  debtAmount = signal<number | null>(null);
  debtDescription = signal('');
  isCheckingDebt = signal(false);
  debtError = signal<string | null>(null);

  isConfirmOpen = signal(false);
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  completedPayment = signal<Payment | null>(null);

  selectedAccount = computed(() => {
    const accountId = this.debitAccountId();
    return this.accounts().find((account) => account.id === accountId);
  });

  manualAmountSignal = toSignal(this.manualAmount.valueChanges, {
    initialValue: this.manualAmount.value,
  });

  amountToPay = computed(() => {
    return this.selectedProvider()?.hasDebtCheck ? this.debtAmount() : this.manualAmountSignal();
  });

  constructor() {
    this.accountService.getAccounts().subscribe((accounts) => this.accounts.set(accounts));
  }

  onSelectCategory(category: PaymentCategoryConfig) {
    this.selectedCategory.set(category);
    this.step.set('provider');
    this.isLoadingProviders.set(true);
    this.paymentService.getProviders(category.key).subscribe({
      next: (providers) => {
        this.providers.set(providers);
        this.isLoadingProviders.set(false);
      },
      error: () => this.isLoadingProviders.set(false),
    });
  }

  onSelectProvider(provider: PaymentProvider) {
    this.selectedProvider.set(provider);
    this.debtAmount.set(null);
    this.manualAmount.reset();
    this.debtDescription.set('');
    this.debtError.set(null);
    this.fieldsArray.clear();

    provider.fields.forEach((field) => {
      const validators = [Validators.required];

      if (field.key === 'phoneNumber' && provider.prefixes?.length) {
        validators.push(azPhoneValidator(provider.prefixes));
      }

      this.fieldsArray.push(
        this.fb.control('', {
          nonNullable: true,
          validators,
        }),
      );
    });
    this.step.set('form');
  }

  private buildFieldsRecord(): Record<string, string> {
    const fields = this.selectedProvider()!.fields;

    return Object.fromEntries(
      fields.map((field, i) => [field.key, this.fieldsArray.at(i)?.value ?? '']),
    );
  }

  onCheckDebt() {
    if (this.fieldsArray.invalid) {
      this.fieldsArray.markAllAsTouched();
      return;
    }

    const provider = this.selectedProvider();
    if (!provider) return;

    this.isCheckingDebt.set(true);
    this.debtError.set(null);

    this.paymentService
      .checkDebt(provider.id, this.buildFieldsRecord())
      .pipe(finalize(() => this.isCheckingDebt.set(false)))
      .subscribe({
        next: (res) => {
          this.debtAmount.set(res.amount);
          this.debtDescription.set(res.description);
        },
        error: (err) => {
          this.debtError.set(err.error?.message ?? 'Borc məlumatı alına bilmədi');
        },
      });
  }

  onProceedToConfirm() {
    if (this.fieldsArray.invalid) {
      this.fieldsArray.markAllAsTouched();
      return;
    }

    if (!this.debitAccountId()) {
      return;
    }

    const provider = this.selectedProvider();
    if (provider?.hasDebtCheck && this.debtAmount() === null) {
      this.debtError.set('Davam etmək üçün əvvəlcə borcu yoxlayın.');
      return;
    }

    if (!provider?.hasDebtCheck && this.manualAmount.invalid) {
      this.manualAmount.markAsTouched();
      return;
    }

    this.isConfirmOpen.set(true);
  }

  onConfirmPay() {
    const provider = this.selectedProvider();
    const account = this.selectedAccount();
    const amount = this.amountToPay();
    const category = this.selectedCategory();

    if (!provider || !account || !amount || !category) return;

    this.isConfirmOpen.set(false);
    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.paymentService
      .pay({
        debitAccountId: account.id,
        providerId: provider.id,
        fields: this.buildFieldsRecord(),
        amount,
        description: provider.hasDebtCheck ? this.debtDescription() : `${provider.name} ödənişi`,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (payment) => {
          this.completedPayment.set(payment);
          this.isSubmitting.set(false);
          this.step.set('success');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.submitError.set(err.error?.message ?? 'Ödəniş uğursuz oldu.');
        },
      });
  }

  onBackToCategories() {
    this.selectedCategory.set(null);
    this.selectedProvider.set(null);
    this.providers.set([]);
    this.step.set('category');
  }

  onBackToProviders() {
    this.step.set('provider');
  }

  onCancelConfirm() {
    this.isConfirmOpen.set(false);
  }

  onNewPayment() {
    this.selectedCategory.set(null);
    this.selectedProvider.set(null);
    this.providers.set([]);
    this.debitAccountId.set(null);
    this.fieldsArray.clear();
    this.manualAmount.reset();
    this.debtAmount.set(null);
    this.debtDescription.set('');
    this.debtError.set(null);
    this.completedPayment.set(null);
    this.submitError.set(null);
    this.step.set('category');
  }
}
