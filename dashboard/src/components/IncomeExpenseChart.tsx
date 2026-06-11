import { useMemo } from 'react';
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, LabelList,
} from 'recharts';
import type { Transaction, ChartDataPoint } from '../types';

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

interface LabelProps {
  x?: number;
  y?: number;
  value?: number;
  fill: string;
}

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
  const chartData = useMemo<ChartDataPoint[]>(() => {
    return payMonths.map(month => {
      const txs = transactions.filter(t => t.payMonth === month);
      return {
        month: month.replace('-', '\n'),
        shortMonth: month.split('-')[0],
        income: txs.filter(t => t.type === 'Income').reduce((s, t) => s + t.amount, 0),
        expenses: Math.abs(txs.filter(t => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)),
      };
    });
  }, [transactions, payMonths]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-700">Income vs Expenses</h3>
          <p className="text-xs text-gray-400">Monthly overview · {payMonths.length} months</p>
        </div>
        <div className="flex items-center gap-4">
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

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 24, right: 16, left: 0, bottom: 0 }}>
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
    </div>
  );
}
