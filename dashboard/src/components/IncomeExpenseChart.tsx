import { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Transaction, ChartDataPoint } from '../types';

const PAGE_SIZE = 6;

function formatY(value: number): string {
  if (value >= 1_000_000) return `R${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `R${(value / 1_000).toFixed(0)}k`;
  return `R${value}`;
}

interface TooltipEntry { name: string; value: number; color: string }
interface CustomTooltipProps { active?: boolean; payload?: TooltipEntry[]; label?: string }

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 shadow-lg text-xs">
        <p className="font-bold text-gray-700 mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }} className="font-semibold">
            {p.name}: R {p.value.toLocaleString('af-ZA', { minimumFractionDigits: 2 })}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

interface LabelProps { x?: number; y?: number; value?: number; fill: string }

const renderLabel = ({ x = 0, y = 0, value, fill }: LabelProps) => {
  if (!value) return null;
  return (
    <text x={x} y={y - 8} fill={fill} fontSize={9} fontWeight={700} textAnchor="middle">
      {formatY(value)}
    </text>
  );
};

interface IncomeExpenseChartProps {
  transactions: Transaction[];
  payMonths: string[];
}

export default function IncomeExpenseChart({ transactions, payMonths }: IncomeExpenseChartProps) {
  const allData = useMemo<ChartDataPoint[]>(() => {
    return payMonths.map(month => {
      const txs = transactions.filter(t => t.payMonth === month);
      return {
        month: month.replace('-', '\n'),
        shortMonth: month,
        income: txs.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0),
        expenses: Math.abs(txs.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)),
      };
    });
  }, [transactions, payMonths]);

  const totalPages = Math.max(1, Math.ceil(allData.length / PAGE_SIZE));

  // Start on the last page (most recent months); sync when data changes
  const [page, setPage] = useState(totalPages - 1);
  useEffect(() => {
    setPage(totalPages - 1);
  }, [totalPages]);

  const safePage = Math.min(page, totalPages - 1);
  const pageData = allData.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const startMonth = pageData[0]?.shortMonth ?? '';
  const endMonth   = pageData[pageData.length - 1]?.shortMonth ?? '';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-700">Income vs Expenses</h3>
          <p className="text-xs text-gray-400">
            {startMonth && endMonth ? `${startMonth} – ${endMonth}` : '—'}
            {' · '}
            {allData.length} months total
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" />
            Income
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-0.5 bg-red-500 inline-block rounded" />
            Expenses
          </span>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={pageData} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="shortMonth"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatY}
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="income"
            name="Income"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          >
            <LabelList content={(props) => renderLabel({ x: props.x as number, y: props.y as number, value: props.value as number, fill: '#10b981' })} />
          </Line>
          <Line
            type="monotone"
            dataKey="expenses"
            name="Expenses"
            stroke="#ef4444"
            strokeWidth={2.5}
            dot={{ fill: '#ef4444', r: 4, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          >
            <LabelList content={(props) => renderLabel({ x: props.x as number, y: props.y as number, value: props.value as number, fill: '#ef4444' })} />
          </Line>
        </LineChart>
      </ResponsiveContainer>

      {/* Pagination bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={13} />
            Prev
          </button>

          <span className="text-xs text-gray-400">
            <span className="font-bold text-gray-700">{safePage + 1}</span>
            {' / '}
            {totalPages}
          </span>

          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage === totalPages - 1}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
            <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
