import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { TransferService } from '../../core/services/transfer.service';
import { Account } from '../../core/models/account.model';
import { differentAccountsValidator } from '../../core/validators/different-accounts.validator';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExchangeRateService } from '../../core/services/exchange-rate.service';
import { sufficientBalanceValidator } from '../../core/validators/sufficient-balance.validator';
import { Transfer } from '../../core/models/transfer.model';
import { ConfirmDialog } from '../../shared/components/confirm-dialog/confirm-dialog';
import { Router, RouterLink } from '@angular/router';
import { TransferTemplate } from '../../core/models/transfer-template.model';

@Component({
  selector: 'app-transfers',
  imports: [ReactiveFormsModule, ConfirmDialog, RouterLink],
  templateUrl: './transfers.html',
  styleUrl: './transfers.css',
  standalone: true,
})
export class Transfers {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private transferService = inject(TransferService);
  private exchangeRateService = inject(ExchangeRateService);
  private router = inject(Router);
  isConfirmOpen = signal(false);
  isSubmitting = signal(false);
  submitError = signal<string | null>(null);
  completedTransfer = signal<Transfer | null>(null);

  exchangeRate = signal<number | null>(null);

  accounts = signal<Account[]>([]);

  transferForm = this.fb.group(
    {
      debitAccountId: [null as number | null, Validators.required],
      creditAccountId: [null as number | null, Validators.required],
      amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
      comment: [''],
    },
    {
      validators: differentAccountsValidator(),
      asyncValidators: sufficientBalanceValidator(this.accountService),
    },
  );

  formValues = toSignal(this.transferForm.valueChanges, {
    initialValue: this.transferForm.value,
  });

  selectedDebitAccount = computed(() => {
    const id = this.formValues()?.debitAccountId;
    return this.accounts().find((a) => a.id === id) || null;
  });

  selectedCreditAccount = computed(() => {
    const id = this.formValues()?.creditAccountId;
    return this.accounts().find((a) => a.id === id) || null;
  });

  insufficientBalance = computed(() => {
    const debitAccount = this.selectedDebitAccount();
    const amount = this.formValues()?.amount;

    if (!debitAccount || !amount) return false;

    return amount > debitAccount.balance;
  });

  currenciesDiffer = computed(() => {
    const debitAccount = this.selectedDebitAccount();
    const creditAccount = this.selectedCreditAccount();

    if (!debitAccount || !creditAccount) return false;

    return debitAccount.currency !== creditAccount.currency;
  });

  fee = computed(() => {
    const amount = this.formValues()?.amount;
    if (!amount || !this.currenciesDiffer()) return 0;

    return Math.round(amount * 0.01 * 100) / 100;
  });

  finalAmount = computed(() => {
    const amount = this.formValues()?.amount;
    const fee = this.fee();
    const rate = this.exchangeRate();

    if (!amount) return 0;

    const afterFee = amount - fee;

    if (this.currenciesDiffer() && rate) {
      return Math.round(afterFee * rate * 100) / 100;
    }

    return afterFee;
  });

  onSubmit() {
    if (this.transferForm.invalid || this.transferForm.pending || this.insufficientBalance()) {
      this.transferForm.markAllAsTouched();
      return;
    }
    this.isConfirmOpen.set(true);
  }

  onConfirmTransfer() {
    if (this.isSubmitting()) {
      return;
    }

    this.isConfirmOpen.set(false);
    this.isSubmitting.set(true);
    this.submitError.set(null);

    const values = this.transferForm.value;

    this.transferService
      .transferMoney({
        debitAccountId: values.debitAccountId!,
        creditAccountId: values.creditAccountId!,
        amount: values.amount!,
        comment: values.comment || '',
        exchangeRate: this.exchangeRate() ?? undefined,
      })
      .subscribe({
        next: (result) => {
          this.completedTransfer.set(result);
          this.isSubmitting.set(false);
          this.refreshAccountBalances();
          console.log(this.completedTransfer());
        },
        error: () => {
          this.submitError.set('Köçürmə uğursuz oldu. Yenidən cəhd edin.');
          this.isSubmitting.set(false);
        },
      });
  }

  private refreshAccountBalances() {
    this.accountService.getAccounts().subscribe((accounts) => {
      this.accounts.set(accounts);
    });
  }

  onCancelConfirm() {
    this.isConfirmOpen.set(false);
  }

  templateSaved = signal(false);

  onSaveAsTemplate() {
    const transfer = this.completedTransfer();
    if (!transfer) return;

    const debitAccount = this.accounts().find((a) => a.id === transfer.debitAccountId);
    const creditAccount = this.accounts().find((a) => a.id === transfer.creditAccountId);

    this.transferService
      .saveAsTemplate({
        debitAccountId: transfer.debitAccountId,
        creditAccountId: transfer.creditAccountId,
        amount: transfer.amount,
        comment: transfer.comment,
        name: `${debitAccount?.name} → ${creditAccount?.name}`,
      })
      .subscribe({
        next: () => {
          this.templateSaved.set(true);
        },
        error: () => {
          this.submitError.set('Şablon saxlanılmadı, yenidən cəhd edin.');
        },
      });
  }

  onNewTransfer() {
    this.completedTransfer.set(null);
    this.templateSaved.set(false);
    this.submitError.set(null);
    this.transferForm.reset();
  }

  constructor() {
    this.accountService.getAccounts().subscribe((accounts) => {
      this.accounts.set(accounts);
    });

    const state = this.router.getCurrentNavigation()?.extras.state as
      { prefillDebitAccountId?: number; template?: TransferTemplate } | undefined;

    const template = state?.template ?? history.state?.template;
    const prefillId = state?.prefillDebitAccountId ?? history.state?.prefillDebitAccountId;

    if (template) {
      this.transferForm.patchValue({
        debitAccountId: template.debitAccountId,
        creditAccountId: template.creditAccountId,
        amount: template.amount,
        comment: template.comment,
      });
    } else if (prefillId) {
      this.transferForm.patchValue({ debitAccountId: prefillId });
    }

    effect(() => {
      const debitAccount = this.selectedDebitAccount();
      const creditAccount = this.selectedCreditAccount();

      if (!debitAccount || !creditAccount || debitAccount.currency === creditAccount.currency) {
        this.exchangeRate.set(null);
        return;
      }

      this.exchangeRateService.getRates(debitAccount.currency).subscribe((res) => {
        const rate = res.rates[creditAccount.currency];
        this.exchangeRate.set(rate ?? null);
      });
    });
  }
}
