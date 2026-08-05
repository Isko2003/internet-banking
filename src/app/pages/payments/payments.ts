import { Component, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AccountService } from '../../core/services/account.service';
import { PaymentService } from '../../core/services/payment.service';
import { PAYMENT_CATEGORIES } from '../../core/constants/payment-categories';

@Component({
  selector: 'app-payments',
  imports: [],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments {
  private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private paymentService = inject(PaymentService);

  categories = PAYMENT_CATEGORIES;

  step = signal<'category' | 'provider' | 'form' | 'success'>('category');
}
