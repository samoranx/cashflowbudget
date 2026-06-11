import { formatZAR } from '../utils/format';
import type { Transaction } from '../types';

interface TransactionTableProps {
  transactions: Transaction[];
  emptyText?: string;
}

export default function TransactionTable({ transactions, emptyText = 'No transactions' }: TransactionTableProps) {
  if (!transactions.length) {
    return <p className="text-center text-sm text-gray-400 py-8">{emptyText}</p>;
  }

  return (
    <div className="overflow-auto max-h-72">
      <table className="w-full text-xs">
        <thead>
          <tr className="sticky top-0 bg-gray-50">
            <th className="text-left py-2 px-3 font-semibold text-gray-400 uppercase tracking-wide">Date</th>
            <th className="text-left py-2 px-3 font-semibold text-gray-400 uppercase tracking-wide">Description</th>
            <th className="text-right py-2 px-3 font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx, i) => (
            <tr
              key={tx.id}
              className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/40'}`}
            >
              <td className="py-2 px-3 text-gray-500 whitespace-nowrap">
                {new Date(tx.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
              </td>
              <td className="py-2 px-3 text-gray-700 font-medium max-w-[180px] truncate" title={tx.description}>
                {tx.description}
              </td>
              <td className={`py-2 px-3 text-right font-semibold whitespace-nowrap ${
                tx.amount < 0 ? 'text-red-500' : 'text-emerald-600'
              }`}>
                {tx.amount < 0 ? '−' : '+'}{formatZAR(Math.abs(tx.amount))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
