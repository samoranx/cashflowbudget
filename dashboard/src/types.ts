export interface Transaction {
  id: number;
  date: string;
  description: string;
  payMonth: string;
  amount: number;
  isRecurring: boolean;
  type: 'Income' | 'Expense';
  category: string;
  bankAccountId: number;
}

export interface BankAccount {
  id: number;
  name: string;
  accountNo: string;
}

export interface CategoryData {
  name: string;
  value: number;
}

export interface ChartDataPoint {
  month: string;
  shortMonth: string;
  income: number;
  expenses: number;
}
