export interface Card {
  id: number;
  userId: number;
  accountId: number;
  number: string;
  type: 'debit' | 'credit' | 'virtual';
  paymentSystem: 'Visa' | 'Mastercard';
  expiry: string;
  status: 'active' | 'blocked' | 'expired' | 'pending activation';
  holderName: string;
  balance: number;
  contactless: boolean;
  dailyLimit: number;
}