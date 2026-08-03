export interface UserTransfer {
    id: number;
    debitAccountId: number;
    recipientType: 'card' | 'iban';
    recipientIdentifier: string;
    recipientName: string;
    amount: number;
    currency: string;
    fee: number;
    purpose: string;
    saveRecipient: boolean;
    status: 'completed' | 'failed';
    date: string;
}