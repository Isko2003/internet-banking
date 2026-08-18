import { BadRequestException, Injectable } from '@nestjs/common';

const AZN_BASE_RATES: Record<string, number> = {
  AZN: 1,
  USD: 0.588,
  EUR: 0.542,
  GBP: 0.462,
  TRY: 20.15,
  RUB: 54.3,
};

@Injectable()
export class ExchangeRatesService {
  getSupportedCurrencies(): string[] {
    return Object.keys(AZN_BASE_RATES);
  }

  getRates(base: string): { base: string; rates: Record<string, number> } {
    const normalizedBase = base.toUpperCase();
    const baseRateFromAzn = AZN_BASE_RATES[normalizedBase];

    if (baseRateFromAzn === undefined) {
      throw new BadRequestException(
        `Dəstəklənməyən valyuta: ${base}. Mövcud valyutalar: ${this.getSupportedCurrencies().join(', ')}`,
      );
    }

    const rates: Record<string, number> = {};

    for (const [currency, rateFromAzn] of Object.entries(AZN_BASE_RATES)) {
      if (currency === normalizedBase) continue;
      // AZN üzərindən keçid: 1 base = (1 AZN in base) tərs nisbətində digər valyutaları hesablayırıq
      const rate = rateFromAzn / baseRateFromAzn;
      rates[currency] = Number(rate.toFixed(6));
    }

    return { base: normalizedBase, rates };
  }
}
