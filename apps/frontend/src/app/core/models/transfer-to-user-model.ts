export interface CreateUserTransferPayload {
  debitAccountId: number;
  recipientType: 'card' | 'iban';
  recipientIdentifier: string;
  recipientName: string;
  amount: number;
  purpose: string;
  saveRecipient: boolean;
  otpSessionId: string;
}

export interface UserTransfer {
  id: number;
  debitAccountId: number;
  userId: number;
  recipientType: 'card' | 'iban';
  recipientIdentifier: string;
  recipientName: string;
  amount: number;
  currency: string;
  transactionId: number;
  fee: number;
  purpose: string | null;
  saveRecipient: boolean;
  status: 'completed' | 'failed';
  date: string;
  createdAt: string;
}
