import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CategoryData } from '../types';

const COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6',
  '#06b6d4', '#f97316', '#84cc16', '#ec4899', '#6366f1',
];

interface TooltipEntry { name: string; value: number }
interface CustomTooltipProps { active?: boolean; payload?: TooltipEntry[] }

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload?.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-lg text-xs">
        <p className="font-semibold text-gray-700">{name}</p>
        <p className="text-gray-500">R {value.toLocaleString('af-ZA', { minimumFractionDigits: 2 })}</p>
      </div>
    );
  }
  return null;
};

interface CategoryDonutProps {
  data: CategoryData[];
}

export default function CategoryDonut({ data }: CategoryDonutProps) {
  if (!data.length) return <p className="text-center text-sm text-gray-400 py-8">No data</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(v: string) => <span className="text-xs text-gray-600">{v}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
