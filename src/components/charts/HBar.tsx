import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { NamedValue } from '../../lib/metrics';
import { CHART, compactNum, tooltipStyle } from './chartTheme';

interface Props {
  data: NamedValue[];
  format?: (v: number) => string;
}

export default function HBar({ data, format = compactNum }: Props) {
  const height = Math.max(data.length * 30 + 12, 60);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        layout="vertical"
        data={data}
        margin={{ top: 0, right: 12, left: 0, bottom: 0 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tick={{ fill: CHART.axis, fontSize: 12 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          cursor={{ fill: CHART.accentDim }}
          contentStyle={tooltipStyle}
          labelStyle={{ color: CHART.axis }}
          formatter={(value) => [format(Number(value)), ''] as [string, string]}
        />
        <Bar dataKey="value" fill={CHART.accent} radius={[0, 3, 3, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  );
}
