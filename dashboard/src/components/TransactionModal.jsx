import { useEffect, useRef } from 'react';
import { X, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatZAR } from '../utils/format';

const CATEGORY_COLORS = {
  'Income':             'bg-emerald-100 text-emerald-700',
  'Insurance & Loans':  'bg-purple-100 text-purple-700',
  'Education':          'bg-blue-100 text-blue-700',
  'Rent & Housing':     'bg-indigo-100 text-indigo-700',
  'Fuel':               'bg-yellow-100 text-yellow-700',
  'Groceries':          'bg-lime-100 text-lime-700',
  'Utilities':          'bg-cyan-100 text-cyan-700',
  'Car & Repairs':      'bg-orange-100 text-orange-700',
  'Food & Dining':      'bg-pink-100 text-pink-700',
  'Family & Transfers': 'bg-rose-100 text-rose-700',
  'Shopping':           'bg-fuchsia-100 text-fuchsia-700',
  'Loan Repayments':    'bg-red-100 text-red-700',
  'Fees & Airtime':     'bg-slate-100 text-slate-700',
  'Cash Withdrawals':   'bg-stone-100 text-stone-700',
  'Other':              'bg-gray-100 text-gray-600',
};

function CategoryBadge({ category }) {
  const cls = CATEGORY_COLORS[category] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
      {category}
    </span>
  );
}

export default function TransactionModal({ type, month, transactions, onClose }) {
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const isIncome = type === 'Income';
  const total = transactions.reduce((s, t) => s + Math.abs(t.amount), 0);
  const Icon = isIncome ? TrendingUp : TrendingDown;
  const accentColor = isIncome ? 'text-emerald-600' : 'text-orange-500';
  const accentBg = isIncome ? 'bg-emerald-500' : 'bg-orange-500';
  const RowIcon = isIncome ? ArrowUpRight : ArrowDownRight;
  const rowIconColor = isIncome ? 'text-emerald-500' : 'text-red-400';

  // Sort by date descending
  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)' }}
      onMouseDown={e => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] animate-in">

        {/* Header */}
        <div className={`${accentBg} rounded-t-2xl px-6 py-5 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">
                {isIncome ? 'Income' : 'Expenses'} — {month}
              </p>
              <p className="text-white/70 text-xs mt-0.5">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white/60 text-[10px] uppercase tracking-wide">Total</p>
              <p className="text-white font-bold text-lg">{formatZAR(total)}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
            >
              <X size={15} className="text-white" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-y-auto flex-1">
          {sorted.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-12">No transactions for this period</p>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="sticky top-0 bg-gray-50 border-b border-gray-100">
                  <th className="text-left py-2.5 px-4 font-semibold text-gray-400 uppercase tracking-wide w-20">Date</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-400 uppercase tracking-wide">Description</th>
                  <th className="text-left py-2.5 px-3 font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Category</th>
                  <th className="text-right py-2.5 px-4 font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((tx, i) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-3 px-4 text-gray-400 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <RowIcon size={13} className={`flex-shrink-0 ${rowIconColor}`} />
                        <span className="text-gray-700 font-medium truncate max-w-[200px]" title={tx.description}>
                          {tx.description}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell">
                      <CategoryBadge category={tx.category} />
                    </td>
                    <td className={`py-3 px-4 text-right font-bold whitespace-nowrap ${isIncome ? 'text-emerald-600' : 'text-red-500'}`}>
                      {isIncome ? '+' : '−'}{formatZAR(Math.abs(tx.amount))}
                    </td>
                  </tr>
                ))}
              </tbody>
              {/* Sticky footer total */}
              <tfoot>
                <tr className="sticky bottom-0 bg-gray-50 border-t-2 border-gray-200">
                  <td colSpan={2} className="py-3 px-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    Total ({transactions.length} transactions)
                  </td>
                  <td className="hidden sm:table-cell" />
                  <td className={`py-3 px-4 text-right font-bold text-sm ${accentColor}`}>
                    {formatZAR(total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
