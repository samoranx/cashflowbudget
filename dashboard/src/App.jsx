import { useState, useMemo, useRef, useEffect } from 'react';
import { TrendingUp, TrendingDown, CreditCard, ChevronDown, Upload, FileText, Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import MetricCard from './components/MetricCard';
import BudgetBar from './components/BudgetBar';
import SpendingPanel from './components/SpendingPanel';
import IncomeExpenseChart from './components/IncomeExpenseChart';
import TransactionModal from './components/TransactionModal';
import BudgetSettings from './screens/BudgetSettings';
import { useTransactions } from './hooks/useTransactions';
import { useBudget } from './hooks/useBudget';

export default function App() {
  const { transactions, payMonths, loading, error, fileName, loadFromFile } = useTransactions();
  const { getBudget, setMonthBudget, resetMonth, resetAll, DEFAULT_BUDGET } = useBudget();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modal, setModal] = useState(null); // { type: 'Income' | 'Expense' }
  const [activeScreen, setActiveScreen] = useState('dashboard');
  const fileInputRef = useRef(null);

  // Default to the most recent month when data loads
  useEffect(() => {
    if (payMonths.length > 0) {
      setSelectedMonth(prev => prev && payMonths.includes(prev) ? prev : payMonths[payMonths.length - 1]);
    }
  }, [payMonths]);

  const filtered = useMemo(
    () => transactions.filter(t => t.payMonth === selectedMonth),
    [transactions, selectedMonth]
  );

  const totalIncome = useMemo(
    () => filtered.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0),
    [filtered]
  );

  const totalExpenses = useMemo(
    () => Math.abs(filtered.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)),
    [filtered]
  );

  const netBalance = totalIncome - totalExpenses;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="text-center">
          <Loader2 size={36} className="text-emerald-500 animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Loading transactions…</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-100 items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-red-100 text-center max-w-sm">
          <FileText size={36} className="text-red-400 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">Could not load CSV</p>
          <p className="text-xs text-gray-400 mb-4">{error}</p>
          <label className="inline-flex items-center gap-2 bg-emerald-500 text-white text-sm font-semibold px-4 py-2 rounded-xl cursor-pointer hover:bg-emerald-600 transition-colors">
            <Upload size={14} />
            Pick a CSV file
            <input type="file" accept=".csv" className="hidden" onChange={e => loadFromFile(e.target.files[0])} />
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
          transactions={transactions}
          payMonths={payMonths}
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
              <p className="text-sm text-gray-400 mt-0.5">Standard Bank — Account 10-10-678-885-8</p>
            </div>

            <div className="flex items-center gap-3">
              {/* CSV loader */}
              <label
                title={`Loaded: ${fileName}`}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <Upload size={13} className="text-emerald-500" />
                <span className="max-w-[120px] truncate">{fileName}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={e => loadFromFile(e.target.files[0])}
                />
              </label>

              {/* Month selector */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(o => !o)}
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  {selectedMonth ?? '—'}
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 py-1 min-w-[120px] max-h-64 overflow-y-auto">
                      {[...payMonths].reverse().map(m => (
                        <button
                          key={m}
                          onClick={() => { setSelectedMonth(m); setDropdownOpen(false); }}
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
            <BudgetBar totalExpenses={totalExpenses} budget={getBudget(selectedMonth)} />
          </div>

          {/* Bottom: spending tabs + chart */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SpendingPanel transactions={filtered} />
            <IncomeExpenseChart transactions={transactions} payMonths={payMonths} />
          </div>

          <p className="text-center text-xs text-gray-300 mt-6">
            Powered by TsoraTech · {transactions.length} transactions loaded from {fileName}
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
