import { Component, inject, signal } from '@angular/core';
import { AccountService } from '../../core/services/account.service';
import { Account } from '../../core/models/account.model';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { luhnValidator } from '../../core/validators/luhn.validator';
import { ibanValidator } from '../../core/validators/iban.validator';

@Component({
  selector: 'app-transfer-to-user',
  imports: [ReactiveFormsModule],
  templateUrl: './transfer-to-user.html',
  styleUrl: './transfer-to-user.css',
})
export class TransferToUser {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  accounts = signal<Account[]>([]);

  transferUserForm = this.fb.group({
    debitAccountId: [null as number | null, Validators.required],
    recipientType: ['card' as 'card' | 'iban', Validators.required],
    recipientIdentifier: ['', Validators.required],
    recipientName: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    purpose: [''],
    saveRecipient: [false],
  })

  detectBank(cardNumber: string): string {
    const digitsOnly = cardNumber.replace(/\s/g, '');
    const masterCardCheck = digitsOnly.slice(0,2);

    if(digitsOnly.startsWith('4')) {
      return 'Visa';
    }

    if(Number(masterCardCheck) >= 51 && Number(masterCardCheck) <= 55) {
      return 'Mastercard';
    }

    return 'Namelum';
  }

  onCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\s/g, '');
    
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');

    this.transferUserForm.patchValue({ recipientIdentifier: formatted }, { emitEvent: false })
  }

  constructor () {
    this.accountService.getAccounts().subscribe((accounts) => {
      this.accounts.set(accounts);
    })

    this.transferUserForm.get('recipientType')?.valueChanges.subscribe((type) => {
      const identifierControl = this.transferUserForm.get('recipientIdentifier');

      if(type === 'card') {
        identifierControl?.setValidators([Validators.required, luhnValidator()]);
      } else {
        identifierControl?.setValidators([Validators.required, ibanValidator()]);
      }

      identifierControl?.updateValueAndValidity();
    })
  }
}
