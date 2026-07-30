export interface Transaction {
  id: number;
  accountId: number;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}