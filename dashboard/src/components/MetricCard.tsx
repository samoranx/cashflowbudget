import { ChevronRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { formatZAR } from '../utils/format';

interface MetricCardProps {
  label: string;
  amount: number;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  subLabel?: string;
  onClick?: () => void;
}

export default function MetricCard({ label, amount, icon: Icon, colorClass, bgClass, subLabel, onClick }: MetricCardProps) {
  const clickable = typeof onClick === 'function';
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 flex-1 min-w-0 transition-all duration-150
        ${clickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 hover:border-gray-200 group' : ''}`}
    >
      <div className={`w-14 h-14 rounded-full ${bgClass} flex items-center justify-center flex-shrink-0`}>
        <Icon size={22} className={colorClass} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className={`text-xl font-bold ${colorClass} truncate`}>{formatZAR(Math.abs(amount))}</p>
        {subLabel && (
          <p className="text-xs text-gray-400 mt-0.5">
            {subLabel}
            {clickable && <span className="ml-1 text-gray-300 group-hover:text-gray-400 transition-colors">· click to view</span>}
          </p>
        )}
      </div>
      {clickable && (
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
      )}
    </div>
  );
}
