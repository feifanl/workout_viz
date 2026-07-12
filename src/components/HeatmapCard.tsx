import { useState } from 'react';
import type { Workout } from '../lib/parse';
import type { RangeKey } from '../lib/buckets';
import { consistencyHeatmap } from '../lib/metrics';
import ChartCard from './ChartCard';
import RangeSelector from './RangeSelector';
import Heatmap from './Heatmap';

interface Props {
  workouts: Workout[];
}

export default function HeatmapCard({ workouts }: Props) {
  const [range, setRange] = useState<RangeKey>('1Y');
  const data = consistencyHeatmap(workouts, range);
  return (
    <ChartCard title="Consistency" right={<RangeSelector value={range} onChange={setRange} />}>
      <Heatmap data={data} />
    </ChartCard>
  );
}
