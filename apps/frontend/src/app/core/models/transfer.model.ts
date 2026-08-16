export interface CreateTransferPayload {
  debitAccountId: number;
  creditAccountId: number;
  amount: number;
  exchangeRate?: number;
  comment?: string;
}

export interface Transfer {
  id: number;
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
