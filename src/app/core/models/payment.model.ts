export interface DebtCheckResult {
  amount: number;
  description: string;
}

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
  transactionId?: number;
}
