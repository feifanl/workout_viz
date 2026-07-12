import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TimeLinePoint } from '../../lib/metrics';
import { CHART, compactNum, tooltipStyle } from './chartTheme';

interface Props {
  data: TimeLinePoint[];
  format?: (v: number) => string;
  height?: number;
}

export default function TimeLine({ data, format = compactNum, height = 220 }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 6, right: 8, left: 0, bottom: 0 }}>
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
          cursor={{ stroke: CHART.grid }}
          contentStyle={tooltipStyle}
          labelStyle={{ color: CHART.axis }}
          formatter={(value) => [format(Number(value)), ''] as [string, string]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={CHART.accent}
          strokeWidth={2}
          connectNulls
          dot={{ r: 3, fill: CHART.dot, strokeWidth: 0 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
