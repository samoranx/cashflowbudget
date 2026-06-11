import { useState, useMemo } from 'react';
import { Target, RotateCcw, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown, Pencil, Save } from 'lucide-react';
import { formatZAR } from '../utils/format';
import type { Transaction } from '../types';

interface MonthBudgetCardProps {
  month: string;
  transactions: Transaction[];
  budget: number;
  defaultBudget: number;
  onSave: (val: number) => void;
  onReset: () => void;
}

function MonthBudgetCard({ month, transactions, budget, defaultBudget, onSave, onReset }: MonthBudgetCardProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saved, setSaved] = useState(false);

  const income   = useMemo(() => transactions.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0), [transactions]);
  const expenses = useMemo(() => Math.abs(transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)), [transactions]);
  const pct      = budget > 0 ? Math.round((expenses / budget) * 100) : 0;
  const over     = expenses > budget;
  const isCustom = budget !== defaultBudget;

  function startEdit() {
    setDraft(String(budget));
    setEditing(true);
    setSaved(false);
  }

  function commit() {
    const val = parseFloat(draft.replace(/[^0-9.]/g, ''));
    if (!isNaN(val) && val > 0) {
      onSave(val);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setEditing(false);
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') setEditing(false);
  }

  const barColor = pct >= 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-400' : 'bg-emerald-500';
  const barWidth = Math.min(pct, 100);

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md ${over ? 'border-red-200' : 'border-gray-100'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800">{month}</span>
          {isCustom && (
            <span className="text-[10px] font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Custom</span>
          )}
          {over && (
            <span className="text-[10px] font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertTriangle size={9} /> Over
            </span>
          )}
        </div>
        {saved && (
          <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
            <CheckCircle2 size={11} /> Saved
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-emerald-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide flex items-center gap-1 mb-0.5">
            <TrendingUp size={10} /> Income
          </p>
          <p className="text-sm font-bold text-emerald-700 truncate">{formatZAR(income)}</p>
        </div>
        <div className="bg-orange-50 rounded-xl px-3 py-2">
          <p className="text-[10px] text-orange-500 font-semibold uppercase tracking-wide flex items-center gap-1 mb-0.5">
            <TrendingDown size={10} /> Spent
          </p>
          <p className="text-sm font-bold text-orange-600 truncate">{formatZAR(expenses)}</p>
        </div>
      </div>

      <div className="mb-3">
        <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">
          Budget Goal
        </label>
        {editing ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center flex-1 border-2 border-blue-400 rounded-xl overflow-hidden">
              <span className="pl-3 text-sm font-bold text-gray-500">R</span>
              <input
                autoFocus
                type="number"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                onKeyDown={handleKey}
                onBlur={commit}
                className="flex-1 px-2 py-2 text-sm font-bold text-gray-800 outline-none bg-transparent"
                min="0"
                step="1000"
              />
            </div>
            <button
              onMouseDown={commit}
              className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-colors flex-shrink-0"
            >
              <Save size={14} className="text-white" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div
              onClick={startEdit}
              className="flex-1 flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors group"
            >
              <span className="text-sm font-bold text-gray-800">{formatZAR(budget)}</span>
              <Pencil size={12} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
            </div>
            {isCustom && (
              <button
                onClick={() => onReset()}
                title="Reset to default"
                className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors flex-shrink-0"
              >
                <RotateCcw size={13} className="text-gray-500" />
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-gray-400 font-medium">Spending progress</span>
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            over ? 'bg-red-100 text-red-600' : pct >= 80 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
          }`}>
            {pct}%
          </span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        {over ? (
          <p className="text-[10px] text-red-500 font-semibold mt-1.5">
            Overspent by {formatZAR(expenses - budget)}
          </p>
        ) : (
          <p className="text-[10px] text-gray-400 mt-1.5">
            {formatZAR(budget - expenses)} remaining
          </p>
        )}
      </div>
    </div>
  );
}

interface BudgetSettingsProps {
  transactions: Transaction[];
  payMonths: string[];
  getBudget: (month: string) => number;
  setMonthBudget: (month: string, value: number) => void;
  resetMonth: (month: string) => void;
  resetAll: () => void;
  DEFAULT_BUDGET: number;
}

export default function BudgetSettings({ transactions, payMonths, getBudget, setMonthBudget, resetMonth, resetAll, DEFAULT_BUDGET }: BudgetSettingsProps) {
  const [globalDraft, setGlobalDraft] = useState('');
  const [globalEditing, setGlobalEditing] = useState(false);
  const [appliedAll, setAppliedAll] = useState(false);

  function applyToAll() {
    const val = parseFloat(globalDraft.replace(/[^0-9.]/g, ''));
    if (!isNaN(val) && val > 0) {
      payMonths.forEach(m => setMonthBudget(m, val));
      setAppliedAll(true);
      setGlobalEditing(false);
      setGlobalDraft('');
      setTimeout(() => setAppliedAll(false), 2500);
    }
  }

  const totalBudgeted = payMonths.reduce((s, m) => s + getBudget(m), 0);
  const totalSpent = useMemo(
    () => Math.abs(transactions.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)),
    [transactions],
  );

  return (
    <div className="flex-1 ml-16 p-6 min-h-screen">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Target size={22} className="text-blue-500" />
            Budget Goals
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Set a spending limit for each month. Click any goal to edit it.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            {globalEditing ? (
              <>
                <span className="text-sm text-gray-500 font-semibold">R</span>
                <input
                  autoFocus
                  type="number"
                  placeholder="60000"
                  value={globalDraft}
                  onChange={e => setGlobalDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') applyToAll(); if (e.key === 'Escape') setGlobalEditing(false); }}
                  className="w-24 text-sm font-bold text-gray-800 outline-none bg-transparent"
                  min="0"
                  step="1000"
                />
                <button
                  onClick={applyToAll}
                  className="text-xs font-bold text-white bg-blue-500 px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Apply to all
                </button>
                <button
                  onClick={() => setGlobalEditing(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => { setGlobalEditing(true); setGlobalDraft(''); }}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
              >
                <Pencil size={12} />
                {appliedAll ? '✓ Applied to all months' : 'Set same budget for all months'}
              </button>
            )}
          </div>

          <button
            onClick={resetAll}
            className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 shadow-sm hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <RotateCcw size={13} />
            Reset all to default ({formatZAR(DEFAULT_BUDGET)})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Budgeted (all months)', value: totalBudgeted, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Spent (all months)', value: totalSpent, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Default Budget / Month', value: DEFAULT_BUDGET, color: 'text-gray-600', bg: 'bg-gray-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl px-5 py-4 border border-white`}>
            <p className="text-xs text-gray-400 font-semibold mb-1">{label}</p>
            <p className={`text-xl font-bold ${color}`}>{formatZAR(value)}</p>
          </div>
        ))}
      </div>

      {payMonths.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">No transaction data loaded yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...payMonths].reverse().map(month => (
            <MonthBudgetCard
              key={month}
              month={month}
              transactions={transactions.filter(t => t.payMonth === month)}
              budget={getBudget(month)}
              defaultBudget={DEFAULT_BUDGET}
              onSave={val => setMonthBudget(month, val)}
              onReset={() => resetMonth(month)}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-gray-300 mt-8">
        Budget goals are saved in your browser · {payMonths.length} months configured
      </p>
    </div>
  );
}
