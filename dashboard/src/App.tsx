import { useState, useMemo, useRef, useEffect } from 'react';
import {
  TrendingUp, TrendingDown, CreditCard, ChevronDown,
  Upload, FileText, Loader2, RefreshCw, Building2,
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import BudgetBar from './components/BudgetBar';
import SpendingPanel from './components/SpendingPanel';
import IncomeExpenseChart from './components/IncomeExpenseChart';
import TransactionModal from './components/TransactionModal';
import BudgetSettings from './screens/BudgetSettings';
import { useTransactions, extractPayMonths } from './hooks/useTransactions';
import { useBudget } from './hooks/useBudget';
import type { BankAccount } from './types';

type ScreenId = 'dashboard' | 'budget-settings' | 'transactions' | 'expenses';
type ModalType = 'Income' | 'Expense';

function formatAccountNo(raw: string): string {
  // Show last 4 digits for long numbers, full for short ones
  const digits = raw.replace(/\D/g, '');
  if (digits.length > 8) return `····${digits.slice(-4)}`;
  return digits;
}

function formatRelativeTime(date: Date): string {
  const secs = Math.round((Date.now() - date.getTime()) / 1000);
  if (secs < 10) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
}

export default function App() {
  const { transactions, bankAccounts, payMonths, loading, error, lastSynced, loadFromFile, refreshNow } = useTransactions();
  const { getBudget, setMonthBudget, resetMonth, resetAll, DEFAULT_BUDGET } = useBudget();

  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [monthDropdownOpen, setMonthDropdownOpen] = useState(false);
  const [modal, setModal] = useState<{ type: ModalType } | null>(null);
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [, setTick] = useState(0); // forces relative-time re-render every 10s
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep the "X ago" label fresh
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 10_000);
    return () => clearInterval(t);
  }, []);

  // Months for the selected account (or all months when no account filter)
  const visiblePayMonths = useMemo(() => {
    if (selectedAccountId === null) return payMonths;
    const acctTxs = transactions.filter(t => t.bankAccountId === selectedAccountId);
    return extractPayMonths(acctTxs);
  }, [transactions, payMonths, selectedAccountId]);

  // Default to the most recent visible month
  useEffect(() => {
    if (visiblePayMonths.length > 0) {
      setSelectedMonth(prev =>
        prev && visiblePayMonths.includes(prev)
          ? prev
          : visiblePayMonths[visiblePayMonths.length - 1],
      );
    }
  }, [visiblePayMonths]);

  // Transactions for the selected account + month
  const filtered = useMemo(() => {
    let txs = transactions;
    if (selectedAccountId !== null) txs = txs.filter(t => t.bankAccountId === selectedAccountId);
    return txs.filter(t => t.payMonth === selectedMonth);
  }, [transactions, selectedAccountId, selectedMonth]);

  const totalIncome = useMemo(
    () => filtered.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0),
    [filtered],
  );
  const totalExpenses = useMemo(
    () => Math.abs(filtered.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)),
    [filtered],
  );
  const netBalance = totalIncome - totalExpenses;

  const selectedAccount: BankAccount | undefined = bankAccounts.find(a => a.id === selectedAccountId);

  // Chart data: per-account filtered
  const chartTransactions = useMemo(() => {
    if (selectedAccountId === null) return transactions;
    return transactions.filter(t => t.bankAccountId === selectedAccountId);
  }, [transactions, selectedAccountId]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading spreadsheet…</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center max-w-sm">
          <FileText size={36} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">Could not load spreadsheet</p>
          <p className="text-xs text-gray-400 mb-4">{error}</p>
          <label className="inline-flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer hover:bg-emerald-600 transition-colors">
            <Upload size={14} />
            Pick an XLSX file
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={e => e.target.files?.[0] && loadFromFile(e.target.files[0])} />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeScreen={activeScreen} onNavigate={setActiveScreen} />

      {/* Budget Settings Screen */}
      {activeScreen === 'budget-settings' && (
        <BudgetSettings
          transactions={selectedAccountId !== null ? transactions.filter(t => t.bankAccountId === selectedAccountId) : transactions}
          payMonths={visiblePayMonths}
          getBudget={getBudget}
          setMonthBudget={setMonthBudget}
          resetMonth={resetMonth}
          resetAll={resetAll}
          DEFAULT_BUDGET={DEFAULT_BUDGET}
        />
      )}

      {/* Dashboard Screen */}
      {activeScreen === 'dashboard' && (
        <main className="flex-1 ml-16 p-6 min-h-screen">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Financial Dashboard</h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {selectedAccount
                  ? `${selectedAccount.name} — ····${selectedAccount.accountNo.slice(-4)}`
                  : `All Accounts · ${bankAccounts.length} banks`}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">

              {/* Sync indicator */}
              <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-400 shadow-sm">
                <button
                  onClick={refreshNow}
                  title="Refresh now"
                  className="text-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  <RefreshCw size={12} />
                </button>
                <span>{lastSynced ? formatRelativeTime(lastSynced) : '—'}</span>
              </div>

              {/* XLSX file picker */}
              <label
                title="Load a different XLSX file"
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Upload size={13} className="text-emerald-500" />
                <span>Transactions.xlsx</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && loadFromFile(e.target.files[0])}
                />
              </label>

              {/* Bank account selector */}
              <div className="relative">
                <button
                  onClick={() => setAccountDropdownOpen(o => !o)}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <Building2 size={14} className="text-blue-400 flex-shrink-0" />
                  <span className="max-w-[130px] truncate">
                    {selectedAccount
                      ? `${selectedAccount.name} ${formatAccountNo(selectedAccount.accountNo)}`
                      : 'All Accounts'}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform flex-shrink-0 ${accountDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {accountDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setAccountDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[200px]">
                      <button
                        onClick={() => { setSelectedAccountId(null); setAccountDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          selectedAccountId === null
                            ? 'bg-slate-900 text-white font-semibold'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span className="font-semibold">All Accounts</span>
                        <span className="text-xs ml-1 opacity-60">{transactions.length} txns</span>
                      </button>
                      {bankAccounts.map(acct => {
                        const count = transactions.filter(t => t.bankAccountId === acct.id).length;
                        return (
                          <button
                            key={acct.id}
                            onClick={() => { setSelectedAccountId(acct.id); setAccountDropdownOpen(false); }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              selectedAccountId === acct.id
                                ? 'bg-slate-900 text-white font-semibold'
                                : 'text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold leading-tight">{acct.name}</p>
                                <p className="text-[11px] opacity-60">····{acct.accountNo.slice(-4)}</p>
                              </div>
                              <span className="text-[11px] opacity-60 flex-shrink-0">{count} txns</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Month selector */}
              <div className="relative">
                <button
                  onClick={() => setMonthDropdownOpen(o => !o)}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  {selectedMonth ?? '—'}
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${monthDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {monthDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setMonthDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[120px] max-h-64 overflow-y-auto">
                      {[...visiblePayMonths].reverse().map(m => (
                        <button
                          key={m}
                          onClick={() => { setSelectedMonth(m); setMonthDropdownOpen(false); }}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            m === selectedMonth
                              ? 'bg-slate-900 text-white font-semibold'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Metric cards */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <MetricCard
              label="Total Income"
              amount={totalIncome}
              icon={TrendingUp}
              colorClass="text-emerald-600"
              bgClass="bg-emerald-100"
              subLabel={`${filtered.filter(t => t.type === 'Income').length} credit transactions`}
              onClick={() => setModal({ type: 'Income' })}
            />
            <MetricCard
              label="Total Expenses"
              amount={totalExpenses}
              icon={TrendingDown}
              colorClass="text-orange-500"
              bgClass="bg-orange-100"
              subLabel={`${filtered.filter(t => t.type === 'Expense').length} debit transactions`}
              onClick={() => setModal({ type: 'Expense' })}
            />
            <MetricCard
              label="Net Balance"
              amount={Math.abs(netBalance)}
              icon={CreditCard}
              colorClass={netBalance >= 0 ? 'text-blue-600' : 'text-red-500'}
              bgClass={netBalance >= 0 ? 'bg-blue-100' : 'bg-red-100'}
              subLabel={netBalance >= 0 ? 'Surplus this month' : 'Deficit this month'}
            />
          </div>

          {/* Budget bar */}
          <div className="mb-6">
            <BudgetBar totalExpenses={totalExpenses} budget={getBudget(selectedMonth ?? '')} />
          </div>

          {/* Spending panel + chart */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SpendingPanel transactions={filtered} />
            <IncomeExpenseChart transactions={chartTransactions} payMonths={visiblePayMonths} />
          </div>

          <p className="text-center text-xs text-gray-300 mt-6">
            Powered by TsoraTech · {transactions.length.toLocaleString()} transactions
            {lastSynced && ` · synced ${formatRelativeTime(lastSynced)}`}
          </p>
        </main>
      )}

      {/* Transaction drill-down modal */}
      {modal && (
        <TransactionModal
          type={modal.type}
          month={selectedMonth}
          transactions={filtered.filter(t => t.type === modal.type)}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
