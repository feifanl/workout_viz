import { useMemo, useState } from 'react';
import type { Workout } from '../lib/parse';
import type { Unit } from '../lib/units';
import { formatVolume, formatWeight } from '../lib/units';
import {
  DEFAULT_RANGE,
  bucketTypeForRange,
  filterByRange,
  type RangeKey,
} from '../lib/buckets';
import * as M from '../lib/metrics';
import ChartCard from './ChartCard';
import StatTile from './StatTile';
import RangeSelector from './RangeSelector';
import Heatmap from './Heatmap';
import ExerciseSelect from './ExerciseSelect';
import ZoomableChart from './charts/ZoomableChart';
import HBar from './charts/HBar';

interface Props {
  workouts: Workout[];
  unit: Unit;
  onReset: () => void;
  skippedRows: number;
}

const fmtInt = (v: number) => `${Math.round(v)}`;
const fmtMin = (v: number) => `${v.toFixed(0)} min`;

export default function Dashboard({ workouts, unit, onReset, skippedRows }: Props) {
  const [range, setRange] = useState<RangeKey>(DEFAULT_RANGE);
  const exercises = useMemo(() => M.exerciseList(workouts), [workouts]);
  const [exercise, setExercise] = useState(exercises[0] ?? '');

  const filtered = useMemo(() => filterByRange(workouts, range), [workouts, range]);
  const type = bucketTypeForRange(range, filtered);

  const fmtVol = (v: number) => formatVolume(v, unit);
  const fmtWt = (v: number) => formatWeight(v, unit);

  const summary = M.summaryStats(filtered, workouts);
  const heatmap = M.consistencyHeatmap(workouts);
  const neglected = M.neglectedMuscles(workouts);
  const durationSeries = M.setDurationByExercise(filtered, exercise, type);
  const showDuration = durationSeries.some((p) => p.value > 0);
  const empty = filtered.length === 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6">
      {skippedRows > 0 && (
        <p className="text-xs text-muted">{skippedRows} unparseable row(s) were skipped.</p>
      )}

      <section className="fade-up grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile label="Workouts" value={fmtInt(summary.totalWorkouts)} />
        <StatTile label="Volume" value={fmtVol(summary.totalVolumeKg)} />
        <StatTile label="Working sets" value={fmtInt(summary.totalSets)} />
        <StatTile label="Weekly streak" value={`${summary.weeklyStreak} wk`} />
      </section>

      <RangeSelector value={range} onChange={setRange} />

      <ChartCard title="Consistency">
        <Heatmap data={heatmap} />
      </ChartCard>

      {empty ? (
        <p className="rounded-lg border border-border bg-panel p-8 text-center text-muted">
          No workouts in this range.
        </p>
      ) : (
        <>
          <section className="space-y-4">
            <ZoomableChart title="Workout frequency" variant="bar" data={M.workoutFrequency(filtered, type)} format={fmtInt} />
            <ZoomableChart title="Avg workout duration" variant="line" data={M.workoutDuration(filtered, type)} format={fmtMin} />
            <ZoomableChart title="Total volume" variant="bar" data={M.volumePerWorkout(filtered, type)} format={fmtVol} />
            <ZoomableChart title="Total working sets" variant="bar" data={M.setsTotal(filtered, type)} format={fmtInt} />
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Per exercise
              </h2>
              <ExerciseSelect options={exercises} value={exercise} onChange={setExercise} />
            </div>
            <div className="space-y-4">
              <ZoomableChart title="Volume" variant="bar" data={M.volumePerExercise(filtered, exercise, type)} format={fmtVol} />
              <ZoomableChart title="Working sets" variant="bar" data={M.setsPerExercise(filtered, exercise, type)} format={fmtInt} />
              <ZoomableChart title="Best weight" variant="line" data={M.bestWeightPerExercise(filtered, exercise, type)} format={fmtWt} />
              {showDuration && (
                <ZoomableChart title="Set duration" variant="bar" data={durationSeries} format={fmtMin} />
              )}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <ChartCard title="Muscle group distribution">
              <HBar data={M.muscleDistribution(filtered)} format={fmtInt} />
            </ChartCard>
            <ChartCard title="Favorite exercises">
              <HBar data={M.favoriteExercises(filtered)} format={fmtInt} />
            </ChartCard>
            <ChartCard title="Favorite muscles">
              <div className="space-y-1">
                {M.favoriteMuscles(filtered).map((m, i) => (
                  <div key={m.name} className="flex justify-between text-sm">
                    <span>{i + 1}. {m.name}</span>
                    <span className="text-muted">{m.value} sets</span>
                  </div>
                ))}
              </div>
            </ChartCard>
            <ChartCard title="Neglected muscles">
              <div className="space-y-1">
                {neglected.map((n) => (
                  <div
                    key={n.group}
                    className={`flex justify-between rounded px-2 py-1 text-sm ${
                      n.daysSince >= 14 ? 'bg-red-500/10 text-red-300' : 'text-text'
                    }`}
                  >
                    <span>{n.group}</span>
                    <span className="text-muted">{n.daysSince}d ago</span>
                  </div>
                ))}
              </div>
            </ChartCard>
          </section>
        </>
      )}

      <div className="pt-2">
        <button
          onClick={onReset}
          className="rounded-md border border-border px-4 py-2 text-sm text-muted transition hover:border-accent/50 hover:text-text"
        >
          Upload a different file
        </button>
      </div>
    </div>
  );
}
