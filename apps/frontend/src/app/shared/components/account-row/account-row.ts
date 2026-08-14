import { Component, Input } from '@angular/core';
import { Account } from '../../../core/models/account.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-account-row',
  imports: [CurrencyPipe],
  templateUrl: './account-row.html',
  styleUrl: './account-row.css',
})
export class AccountRow {
  @Input({ required: true }) account!: Account;
}
