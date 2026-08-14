export interface Transaction {
  id: number;
  accountId: number;
  cardId?: number;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  status: 'completed' | 'processing' | 'declined' | 'cancelled';
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
}
