export interface DebtCheckResult {
  amount: number;
  description: string;
}

// Backend-ə göndərilən — DTO-ya tam uyğun
export interface CreatePaymentPayload {
  debitAccountId: number;
  providerId: number;
  fields: Record<string, string>;
  amount: number;
  description?: string;
}

// Backend-dən qaytarılan — dəyişməz
export interface Payment {
  id: number;
  debitAccountId: number;
  category: string;
  providerId: number;
  providerName: string;
  fields: Record<string, string>;
  amount: number;
  description: string;
  status: 'completed' | 'failed';
  date: string;
  transactionId: number;
}
