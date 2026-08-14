export interface TransferTemplate {
  id: number;
  debitAccountId: number;
  creditAccountId: number;
  amount: number;
  comment: string;
  name: string;
  isFavorite: boolean;
}
