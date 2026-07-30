import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { TransferService } from '../../core/services/transfer.service';
import { Account } from '../../core/models/account.model';
import { differentAccountsValidator } from '../../core/validators/different-accounts.validator';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExchangeRateService } from '../../core/services/exchange-rate.service';

@Component({
  selector: 'app-transfers',
  imports: [ReactiveFormsModule],
  templateUrl: './transfers.html',
  styleUrl: './transfers.css',
  standalone: true,
})
export class Transfers {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private transferService = inject(TransferService);
  private exchangeRateService = inject(ExchangeRateService);

  exchangeRate = signal<number | null>(null);

  accounts = signal<Account[]>([]);

  transferForm = this.fb.group({
    debitAccountId: [null as number | null, Validators.required],
    creditAccountId: [null as number | null, Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    comment: [''],
  }, {validators: differentAccountsValidator() });

  formValues = toSignal(this.transferForm.valueChanges, {
    initialValue: this.transferForm.value,
  })

  selectedDebitAccount = computed(() => {
    const id = this.formValues()?.debitAccountId;
    return this.accounts().find((a) => a.id === id) || null;
  });

  selectedCreditAccount = computed(() => {
    const id = this.formValues()?.creditAccountId;
    return this.accounts().find((a) => a.id === id) || null;
  })

  insufficientBalance = computed(() => {
    const debitAccount = this.selectedDebitAccount();
    const amount = this.formValues()?.amount;
    
    if(!debitAccount || !amount) return false;

    return amount > debitAccount.balance;
  })

  currenciesDiffer = computed(() => {
    const debitAccount = this.selectedDebitAccount();
    const creditAccount = this.selectedCreditAccount();

    if(!debitAccount || !creditAccount) return false;

    return debitAccount.currency !== creditAccount.currency;
  })

  fee = computed(() => {
    const amount = this.formValues()?.amount;
    if(!amount || !this.currenciesDiffer()) return 0;

    return Math.round(amount * 0.01 * 100) / 100;
  })

  finalAmount = computed(() => {
    const amount = this.formValues()?.amount;
    const fee = this.fee();
    const rate = this.exchangeRate();

    if(!amount) return 0;

    const afterFee = amount - fee;

    if(this.currenciesDiffer() && rate) {
      return Math.round(afterFee * rate * 100) / 100;
    }

    return afterFee;
  })

  onSubmit() {
    console.log('Submit', this.transferForm.value);
  }

  constructor() {
    this.accountService.getAccounts().subscribe((accounts) => {
      this.accounts.set(accounts);
    })

    effect(() => {
      const debitAccount = this.selectedDebitAccount();
      const creditAccount = this.selectedCreditAccount();

      if(!debitAccount || !creditAccount || debitAccount.currency === creditAccount.currency) {
        this.exchangeRate.set(null);
        return;
      }

      this.exchangeRateService.getRates(debitAccount.currency).subscribe((res) => {
        const rate = res.rates[creditAccount.currency];
        this.exchangeRate.set(rate ?? null);
      })
    })
  }
}
