export interface Card {
  id: number;
  userId: number;
  accountId: number;
  number: string;
  type: string;
  expiry: string;
  status: 'active' | 'blocked';
}