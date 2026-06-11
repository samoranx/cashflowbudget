import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { formatZAR } from '../utils/format';

interface BudgetBarProps {
  totalExpenses: number;
  budget?: number;
}

export default function BudgetBar({ totalExpenses, budget = 60000 }: BudgetBarProps) {
  const pct = Math.round((totalExpenses / budget) * 100);
  const overspent = totalExpenses > budget;
  const barWidth = Math.min(pct, 100);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-semibold text-gray-600">Budgeted Spending</p>
        <span className="text-xs text-gray-400">Budget: {formatZAR(budget)}</span>
      </div>

      <div className="flex items-end justify-between mb-2">
        <p className={`text-2xl font-bold ${overspent ? 'text-red-500' : 'text-emerald-500'}`}>
          {formatZAR(totalExpenses)}
        </p>
        <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
          overspent ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
        }`}>
          {pct}%
        </span>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${overspent ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      {overspent ? (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <AlertTriangle size={15} className="text-red-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-red-600">
            YOU HAVE OVERSPENT BY {formatZAR(totalExpenses - budget)}
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
          <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-emerald-600">
            {formatZAR(budget - totalExpenses)} remaining in budget
          </p>
        </div>
      )}
    </div>
  );
}
