import { Component, Input } from '@angular/core';
import { Transaction } from '../../../core/models/transaction.model';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-transaction-row',
  imports: [CurrencyPipe],
  templateUrl: './transaction-row.html',
  styleUrl: './transaction-row.css',
})
export class TransactionRow {
  @Input({ required: true }) transaction!: Transaction;
}
