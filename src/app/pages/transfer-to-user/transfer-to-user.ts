import { Component, computed, inject, signal } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../core/models/account.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { luhnValidator } from '../../core/validators/luhn.validator';
import { ibanValidator } from '../../core/validators/iban.validator';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, startWith, take } from 'rxjs';
import { OtpService } from '../../core/services/otp.service';
import { UserTransfer } from '../../core/models/transfer-to-user-model';
import { UserTransferService } from '../../core/services/user-transfer.service';
import { OtpInput } from '../../shared/components/otp-input/otp-input';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-transfer-to-user',
  imports: [ReactiveFormsModule, OtpInput, RouterLink],
  templateUrl: './transfer-to-user.html',
  styleUrl: './transfer-to-user.css',
})
export class TransferToUser {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private otpService = inject(OtpService);
  private userTransferService = inject(UserTransferService);

  accounts = signal<Account[]>([]);
  step = signal<'form' | 'otp' | 'success'>('form');
  sessionId = signal<string | null>(null);
  otpError = signal<string | null>(null);
  resendCooldown = signal(0);
  isVerifying = signal(false);
  completedTransfer = signal<UserTransfer | null>(null);

  transferUserForm = this.fb.group({
    debitAccountId: [null as number | null, Validators.required],
    recipientType: ['card' as 'card' | 'iban', Validators.required],
    recipientIdentifier: ['', Validators.required],
    recipientName: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    purpose: [''],
    saveRecipient: [false],
  });

  otpForm = this.fb.group({
    otp: ['', [Validators.required, Validators.pattern(/^\d{6}$/), Validators.maxLength(6)]],
  });

  onFormNext() {
    if (this.transferUserForm.invalid) {
      this.transferUserForm.markAllAsTouched();
      return;
    }
    this.otpService.sendOtp().subscribe((res) => {
      this.sessionId.set(res.sessionId);
      this.step.set('otp');
      this.startResendCooldown();
    });
  }

  onResendOtp() {
    if (this.resendCooldown() > 0) return;

    this.otpService.sendOtp().subscribe((res) => {
      this.sessionId.set(res.sessionId);
      this.startResendCooldown();
    });
  }

  private startResendCooldown() {
    this.resendCooldown.set(30);

    interval(1000)
      .pipe(take(30))
      .subscribe(() => {
        this.resendCooldown.update((v) => v - 1);
      });
  }

  onBack() {
    this.step.set('form');
  }

  onOtpSubmit() {
    if (this.otpForm.invalid || this.isVerifying()) {
      return;
    }

    const sessionId = this.sessionId();
    const code = this.otpForm.value.otp;

    if (!sessionId || !code) return;

    this.isVerifying.set(true);
    this.otpError.set(null);

    this.otpService.verifyOtp(sessionId, code).subscribe({
      next: () => {
        const values = this.transferUserForm.value;
        const debitAccount = this.accounts().find((a) => a.id === values.debitAccountId);

        this.userTransferService
          .sendTransfer({
            debitAccountId: values.debitAccountId!,
            recipientType: values.recipientType!,
            recipientIdentifier: values.recipientIdentifier!,
            recipientName: values.recipientName!,
            amount: values.amount!,
            currency: debitAccount!.currency,
            fee: this.fee(),
            purpose: values.purpose || '',
            saveRecipient: values.saveRecipient || false,
            status: 'completed',
            date: new Date().toISOString().split('T')[0],
          })
          .subscribe({
            next: (res) => {
              this.isVerifying.set(false);
              this.completedTransfer.set(res);
              this.step.set('success');
            },
            error: () => {
              this.isVerifying.set(false);
              this.otpError.set('Köçürmə uğursuz oldu');
            },
          });
      },
      error: (err) => {
        this.isVerifying.set(false);
        this.otpError.set(err.error?.message || 'Yanlış kod');
      },
    });
  }

  detectBank(cardNumber: string): string {
    const digitsOnly = cardNumber.replace(/\s/g, '');
    const masterCardCheck = digitsOnly.slice(0, 2);

    if (digitsOnly.startsWith('4')) {
      return 'Visa';
    }

    if (Number(masterCardCheck) >= 51 && Number(masterCardCheck) <= 55) {
      return 'Mastercard';
    }

    return 'Namelum';
  }

  onCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\s/g, '');

    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');

    this.transferUserForm.patchValue({ recipientIdentifier: formatted }, { emitEvent: false });
  }

  formValues = toSignal(this.transferUserForm.valueChanges, {
    initialValue: this.transferUserForm.value,
  });

  fee = computed(() => {
    const amount = this.formValues()?.amount;
    if (!amount) return 0;

    return Math.round(amount * 0.02 * 100) / 100;
  });

  finalAmount = computed(() => {
    const amount = this.formValues()?.amount;
    const fee = this.fee();

    if (!amount) return 0;

    return Math.round((amount - fee) * 100) / 100;
  });

  constructor() {
    this.accountService.getAccounts().subscribe((accounts) => {
      this.accounts.set(accounts);
    });

    this.transferUserForm
      .get('recipientType')
      ?.valueChanges.pipe(startWith(this.transferUserForm.get('recipientType')?.value))
      .subscribe((type) => {
        const identifierControl = this.transferUserForm.get('recipientIdentifier');

        if (type === 'card') {
          identifierControl?.setValidators([Validators.required, luhnValidator()]);
        } else {
          identifierControl?.setValidators([Validators.required, ibanValidator()]);
        }

        identifierControl?.updateValueAndValidity();
      });
  }
}
