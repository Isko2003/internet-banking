import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

interface CbarValute {
  '@_Code': string;
  Nominal: number | string;
  Name: string;
  Value: number | string;
}

const STATIC_FALLBACK_RATES: Record<string, number> = {
  AZN: 1,
  USD: 0.588,
  EUR: 0.542,
  GBP: 0.462,
  TRY: 20.15,
  RUB: 54.3,
};

const SUPPORTED_CURRENCIES = Object.keys(STATIC_FALLBACK_RATES);

const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_LOOKBACK_DAYS = 5;
const FETCH_TIMEOUT_MS = 5000;

@Injectable()
export class ExchangeRatesService {
  private readonly logger = new Logger(ExchangeRatesService.name);
  private readonly xmlParser = new XMLParser({ ignoreAttributes: false });

  private cachedRates: Record<string, number> = STATIC_FALLBACK_RATES;
  private cachedAt = 0;
  private cachedSourceDate: string | null = null;

  getSupportedCurrencies(): string[] {
    return SUPPORTED_CURRENCIES;
  }

  async getRates(base: string): Promise<{
    base: string;
    rates: Record<string, number>;
    asOf: string | null;
  }> {
    await this.ensureFreshRates();

    const normalizedBase = base.toUpperCase();
    const baseRate = this.cachedRates[normalizedBase];

    if (baseRate === undefined) {
      throw new BadRequestException(
        `Dəstəklənməyən valyuta: ${base}. Mövcud valyutalar: ${this.getSupportedCurrencies().join(', ')}`,
      );
    }

    const rates: Record<string, number> = {};
    for (const [currency, rate] of Object.entries(this.cachedRates)) {
      if (currency === normalizedBase) continue;
      rates[currency] = Number((rate / baseRate).toFixed(6));
    }

    return { base: normalizedBase, rates, asOf: this.cachedSourceDate };
  }

  private async ensureFreshRates(): Promise<void> {
    const isStale = Date.now() - this.cachedAt > CACHE_TTL_MS;
    if (!isStale) return;

    const fresh = await this.fetchFromCbarWithLookback();

    if (fresh) {
      this.cachedRates = fresh.rates;
      this.cachedSourceDate = fresh.date;
      this.cachedAt = Date.now();
    } else {
      this.logger.warn(
        'CBAR-dan məzənnə alına bilmədi, mövcud/statik dəyərlər istifadə olunur',
      );
    }
  }

  private async fetchFromCbarWithLookback(): Promise<{
    rates: Record<string, number>;
    date: string;
  } | null> {
    for (let daysBack = 0; daysBack < MAX_LOOKBACK_DAYS; daysBack++) {
      const date = new Date();
      date.setDate(date.getDate() - daysBack);
      const dateStr = this.formatDate(date);

      try {
        const rates = await this.fetchFromCbar(dateStr);
        if (rates) return { rates, date: dateStr };
      } catch (err) {
        this.logger.debug(
          `CBAR ${dateStr} tarixi üçün alınmadı: ${(err as Error).message}`,
        );
      }
    }
    return null;
  }

  private formatDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `${dd}.${mm}.${date.getFullYear()}`;
  }

  private async fetchFromCbar(
    dateStr: string,
  ): Promise<Record<string, number> | null> {
    const url = `https://www.cbar.az/currencies/${dateStr}.xml`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) return null;

      const xml = await response.text();
      const parsed = this.xmlParser.parse(xml);
      const valTypes = parsed?.ValCurs?.ValType;
      if (!valTypes) return null;

      const valTypeArray = Array.isArray(valTypes) ? valTypes : [valTypes];
      const foreignBlock = valTypeArray.find(
        (vt) => vt['@_Type'] === 'Xarici valyutalar',
      );
      if (!foreignBlock?.Valute) return null;

      const valuteList: CbarValute[] = Array.isArray(foreignBlock.Valute)
        ? foreignBlock.Valute
        : [foreignBlock.Valute];

      const rates: Record<string, number> = { AZN: 1 };

      for (const valute of valuteList) {
        const code = valute['@_Code'];
        if (!SUPPORTED_CURRENCIES.includes(code)) continue;

        const nominal = Number(valute.Nominal);
        const aznValue = Number(valute.Value);
        if (!nominal || !aznValue) continue;

        rates[code] = nominal / aznValue;
      }

      const missing = SUPPORTED_CURRENCIES.filter((c) => !(c in rates));
      if (missing.length > 0) {
        this.logger.warn(
          `CBAR cavabında bu valyutalar tapılmadı: ${missing.join(', ')}`,
        );
        return null;
      }

      return rates;
    } finally {
      clearTimeout(timeout);
    }
  }
}
