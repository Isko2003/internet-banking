export interface ExchangeRateResponse {
  base: string;
  rates: Record<string, number>;
  asOf: string | null;
}
