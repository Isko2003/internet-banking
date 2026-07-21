import { CommonModule, CurrencyPipe, KeyValuePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ExchangeRateService } from '../../../core/services/exchange-rate.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-exchange-rates',
  imports: [CommonModule, CurrencyPipe, KeyValuePipe],
  templateUrl: './exchange-rates.html',
  styleUrl: './exchange-rates.css',
})
export class ExchangeRates {
  private exchangeRateService = inject(ExchangeRateService);

  currencies = ['AZN', 'USD', 'EUR'];

  rateData = toSignal(this.exchangeRateService.rates$);

  onCurrencyChange(currency: string) {
    this.exchangeRateService.setBaseCurrency(currency);
  }

  onRefresh() {
    this.exchangeRateService.refresh();
  }
}
