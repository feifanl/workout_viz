import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimePoint } from '../../lib/metrics';
import { CHART, compactNum, tooltipStyle } from './chartTheme';

interface Props {
  data: TimePoint[];
  format?: (v: number) => string;
  height?: number;
}

export default function TimeBar({ data, format = compactNum, height = 220 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: CHART.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={{ stroke: CHART.grid }}
          minTickGap={20}
        />
        <YAxis
          width={44}
          tick={{ fill: CHART.axis, fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          tickFormatter={compactNum}
        />
        <Tooltip
          cursor={{ fill: CHART.accentDim }}
          contentStyle={tooltipStyle}
          labelStyle={{ color: CHART.axis }}
          formatter={(value) => [format(Number(value)), ''] as [string, string]}
        />
        <Bar dataKey="value" fill={CHART.accent} radius={[3, 3, 0, 0]} maxBarSize={48} />
      </BarChart>
    </ResponsiveContainer>
  );
}
