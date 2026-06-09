import { LayoutDashboard, Target, ArrowLeftRight, Receipt, LogOut, TrendingUp } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'budget-settings', icon: Target,           label: 'Budget Goals' },
  { id: 'transactions',    icon: ArrowLeftRight,   label: 'Transactions' },
  { id: 'expenses',        icon: Receipt,          label: 'Expenses' },
];

export default function Sidebar({ activeScreen, onNavigate }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-16 bg-slate-900 flex flex-col items-center py-6 gap-2 z-50 shadow-xl">
      {/* Logo */}
      <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center mb-4 flex-shrink-0">
        <TrendingUp size={18} className="text-white" />
      </div>

      <nav className="flex flex-col gap-1 flex-1 w-full px-2">
        {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
          const isActive = activeScreen === id;
          const isClickable = id === 'dashboard' || id === 'budget-settings';
          return (
            <button
              key={id}
              title={label}
              onClick={() => isClickable && onNavigate(id)}
              className={`w-full h-10 rounded-xl flex items-center justify-center transition-colors ${
                isActive
                  ? 'bg-emerald-500 text-white'
                  : isClickable
                  ? 'text-slate-400 hover:bg-slate-700 hover:text-white cursor-pointer'
                  : 'text-slate-600 cursor-default'
              }`}
            >
              <Icon size={18} />
            </button>
          );
        })}
      </nav>

      <button
        title="Logout"
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-500/20 hover:text-red-400 transition-colors"
      >
        <LogOut size={18} />
      </button>
    </aside>
  );
}
