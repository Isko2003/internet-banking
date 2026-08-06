export interface CategoryBreakDown {
  category: string;
  amount: number;
  percentage: number;
}

export interface MonthlyTrendPoint {
  month: string;
  income: number;
  expense: number;
}

export interface AnalyticsSummary {
  totalIncome: number;
  totalExpense: number;
  difference: number;
  previousMonthExpense: number;
  expenseChangePercent: number | null;
}
