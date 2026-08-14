export interface Transfer {
  id: number;
  userId: number;
  debitAccountId: number;
  creditAccountId: number;
  amount: number;
  currency: string;
  fee: number;
  exchangeRate?: number;
  finalAmount: number;
  comment: string;
  status: 'completed' | 'failed';
  date: string;
  transactionId?: number;
}
