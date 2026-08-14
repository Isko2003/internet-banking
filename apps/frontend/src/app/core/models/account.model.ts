export interface Account {
    id: number;
    userId: number;
    name: string;
    iban: string;
    balance: number;
    currency: string;
    blockedAmount: number;
    status: "active" | "blocked" | "closed";
    openedDate: string;
}