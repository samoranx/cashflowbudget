import { useState, useMemo } from 'react';
import TransactionTable from './TransactionTable';
import CategoryDonut from './CategoryDonut';
import { formatZAR } from '../utils/format';
import type { Transaction, CategoryData } from '../types';

const TABS = [
  { id: 'debit-tx',   label: 'Debit Orders' },
  { id: 'debit-cat',  label: 'Debit Categories' },
  { id: 'expense-tx', label: 'Expenses' },
  { id: 'expense-cat',label: 'Expense Categories' },
] as const;

type TabId = typeof TABS[number]['id'];

function buildCategoryData(transactions: Transaction[]): CategoryData[] {
  const map: Record<string, number> = {};
  transactions.forEach(tx => {
    map[tx.category] = (map[tx.category] ?? 0) + Math.abs(tx.amount);
  });
  return Object.entries(map)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value);
}

interface SpendingPanelProps {
  transactions: Transaction[];
}

export default function SpendingPanel({ transactions }: SpendingPanelProps) {
  const [activeTab, setActiveTab] = useState<TabId>('debit-tx');

  const debitOrders = useMemo(
    () => transactions.filter(t => t.isRecurring && t.type === 'Expense'),
    [transactions],
  );
  const normalExpenses = useMemo(
    () => transactions.filter(t => !t.isRecurring && t.type === 'Expense'),
    [transactions],
  );
  const debitCategories = useMemo(() => buildCategoryData(debitOrders), [debitOrders]);
  const expenseCategories = useMemo(() => buildCategoryData(normalExpenses), [normalExpenses]);

  const debitTotal = useMemo(
    () => debitOrders.reduce((s, t) => s + Math.abs(t.amount), 0),
    [debitOrders],
  );
  const expenseTotal = useMemo(
    () => normalExpenses.reduce((s, t) => s + Math.abs(t.amount), 0),
    [normalExpenses],
  );

  const tabTotal = activeTab === 'debit-tx' ? debitTotal : activeTab === 'expense-tx' ? expenseTotal : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
      <div className="flex items-center border-b border-gray-100 px-4 pt-4 gap-1 flex-wrap">
        <div className="flex gap-1 flex-1 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-xs font-semibold px-3 py-2 rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-slate-900 text-white'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {tabTotal !== null && (
          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full mb-1 whitespace-nowrap">
            {formatZAR(tabTotal)}
          </span>
        )}
      </div>

      <div className="flex-1 p-4">
        {activeTab === 'debit-tx' && (
          <TransactionTable transactions={debitOrders} emptyText="No debit orders this month" />
        )}
        {activeTab === 'debit-cat' && (
          <CategoryDonut data={debitCategories} />
        )}
        {activeTab === 'expense-tx' && (
          <TransactionTable transactions={normalExpenses} emptyText="No expenses this month" />
        )}
        {activeTab === 'expense-cat' && (
          <CategoryDonut data={expenseCategories} />
        )}
      </div>
    </div>
  );
}
